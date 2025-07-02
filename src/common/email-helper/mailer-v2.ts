/* istanbul ignore file */
import { merge } from 'lodash';
import * as postmark from 'postmark';
import ejs from 'ejs';
import Polyglot from 'node-polyglot';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import sendgrid from '@sendgrid/mail';
import { EEnviroment } from '../../common/env.helper';
import { Settings } from '../../settings';
import { createTransport } from 'nodemailer';
import { configService } from '../../config/config.service';
import { handleUnexpectedError } from '../handle-unexpected-error';
import { UserService } from '../../modules/user/user.service';
interface IEmailInput {
  template: string;
  subject: string;
  locale: string;
  payload: Object;
  from: string;
  to: string;
}

interface IEmailDetail {
  subject: string;
  body: string;
  from: string;
  to: string;
}

export enum EEmailTemplate {
  REGISTRATION_CONFIRMATION = 'registration-confirmation',
  PASSWORD_RESET = 'password-reset',
  APPROVED_KYC = 'approved-kyc',
  REJECTED_KYC = 'rejected-kyc',
  BUY_TOKEN_CONFIRMATION_FOR_USER = 'buy_token_confirmation_for_user',
  BUY_TOKEN_CONFIRMATION_FOR_PRESENTER = 'buy_token_confirmation_for_presenter',
  REJECTED_WITHDRAW = 'rejected_withdraw',
  CHANGE_PIN_CODE = 'change-pin-code',
  REQUEST_WITHDRAW = 'request-withdraw',
  ACCEPTED_WITHDRAWAL = 'accepted-withdrawal',
  FORGOT_PIN_CODE = 'forgot-pin-code',
  DOCUMENT_TO_SIGN = 'document-to-sign',
  OTP_ADD_WALLET = 'user-wallet-add',
  OTP_REVOKER_WALLET = 'user-wallet-revoker',
  OTP_LINK_WALLET = 'user-link-wallet',
  OTP_LINK_EMAIL = 'user-link-email',
  REJECT_SIGN_DOCUMENT = 'reject-sign-document',
  OTP_TWO_FA = 'user-two-fa',
  OTP_CHANGE_PASSWORD = 'user-change-password',
  SIGN_DOCUMENT_SUCCESS = 'sign-document-success',
  ACCOUNT_TO_NEW_EMPLOYEE = 'account-to-new-employee',
  WELCOME_TO_CORPORATION = 'welcome-to-corporation',
  SEND_CONTRACT_TO_EMPLOYEE_BY_ROLE = 'send-contract-to-employee-by-role',
  CONTRACT_APPROVAL_NOTIFICATION = 'contract-approval-notification',
  PACKAGE_TO_SIGN = 'package-to-sign'
}

export interface IReceiver {
  email: string;
  firstName: string;
  lastName: string;
  locale: string;
}

class EmailGenerator {
  static getTranslator({ locale, payload }: IEmailInput) {
    const polyglot = new Polyglot({ locale });
    polyglot.extend(this.readJSONFile(locale));

    // chuyển boolean thành string
    const processedPayload = Object.keys(payload).reduce(
      (acc: Record<string, any>, key: string) => {
        const value = (payload as Record<string, any>)[key];
        acc[key] = typeof value === 'boolean' ? value.toString() : value;
        return acc;
      },
      {} as Record<string, any>
    );

    polyglot.extend({ $: processedPayload });
    return polyglot.t.bind(polyglot);
  }

  private static readJSONFile(locale: string) {
    const FALLBACK_PATH = './translations/en.json';
    const path = `./translations/${locale}.json`;
    return JSON.parse(
      readFileSync(existsSync(path) ? path : FALLBACK_PATH, 'utf8')
    );
  }

  static async generate(input: IEmailInput): Promise<IEmailDetail> {
    const { template, from, to } = input;
    const path = `./templates/${template}.ejs`;
    const translate = this.getTranslator(input);
    const body = await ejs.renderFile<string>(path, { translate });
    const SHOULD_PRINT_BODY = false;
    if (
      configService.getEnv('NODE_ENV') === EEnviroment.TEST &&
      SHOULD_PRINT_BODY
    )
      writeFileSync(`dist/${template}.html`, body);
    return {
      subject: ejs.render(input.subject, { translate }),
      body,
      from,
      to
    };
  }
}

abstract class EmailSender {
  static async process(input: IEmailInput) {
    try {
      const emailDetail = await EmailGenerator.generate(input);
      if (configService.getEnv('NODE_ENV') === EEnviroment.TEST) return;
      this.send(emailDetail);
    } catch (error) {
      handleUnexpectedError(error as any);
    }
  }

  // tslint:disable-next-line: no-any
  static async send(detail: IEmailDetail): Promise<any> {
    // implement on sub class
  }
}

sendgrid.setApiKey(configService.getEnv('SENDGRID_API_KEY'));

export class Sendgrid extends EmailSender {
  static async send({ to, body, subject }: IEmailDetail) {
    return sendgrid.send({
      from: Settings.POSTMARK_SENDER_EMAIL,
      to,
      html: body,
      subject
    });
  }
}

export class Mailguns extends EmailSender {
  private static mailgun = createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    tls: { ciphers: 'SSLv3' },
    auth: {
      user: 'postmaster@mg.kokatrade.com',
      pass: configService.getEnv('MAILGUN_API_KEY')
    }
  });

  static async send({ to, body, subject }: IEmailDetail) {
    return this.mailgun.sendMail({
      from: Settings.POSTMARK_SENDER_EMAIL,
      to,
      html: body,
      subject
    });
  }
}

export class Postmark extends EmailSender {
  private static client = new postmark.ServerClient(
    configService.getEnv('POSTMARK_SERVER_API_TOKEN')
  );

  static async send({ to, body, subject, from }: IEmailDetail) {
    return this.client.sendEmail({
      From: from,
      To: to,
      HtmlBody: body,
      Subject: subject
    });
  }
}

export class Mailer {
  private static async getReceiver(userId: number): Promise<IReceiver> {
    // const user = await User.findById(userId);
    const user = { email: 'a@b.com', firstName: 'a', lastName: 'b' };
    // const language = await Language.findById(2);
    const language = { code: 'en_us' };
    return {
      email: user.email,
      locale: language.code,
      firstName: user.firstName,
      lastName: user.lastName
    };
  }

  private static getSubjectByTemplate(template: EEmailTemplate): string {
    if (template === EEmailTemplate.REGISTRATION_CONFIRMATION)
      return 'Welcome to Decot! Confirm Your Registration';
    if (template === EEmailTemplate.PASSWORD_RESET)
      return 'Reset Your Password for <%= translate("$.productName") %>';
    if (template === EEmailTemplate.APPROVED_KYC)
      return 'Approve KYC for <%= translate("$.productName") %>';
    if (template === EEmailTemplate.REJECTED_KYC)
      return 'Reject KYC for <%= translate("$.productName") %>';
    if (template === EEmailTemplate.BUY_TOKEN_CONFIRMATION_FOR_USER)
      return 'Buy <%= translate("$.coinName") %> token';
    if (template === EEmailTemplate.BUY_TOKEN_CONFIRMATION_FOR_PRESENTER)
      return 'Receive direct referral commission';
    if (template === EEmailTemplate.REJECTED_WITHDRAW)
      return 'Rejected Withdrawal for <%= translate("$.productName") %>';
    if (template === EEmailTemplate.CHANGE_PIN_CODE)
      return 'Change Pin Code for <%= translate("$.productName") %>';
    if (template === EEmailTemplate.REQUEST_WITHDRAW)
      return 'Request withdraw for <%= translate("$.productName") %>';
    if (template === EEmailTemplate.FORGOT_PIN_CODE)
      return 'Forgot Pin Code for <%= translate("$.productName") %>';
    if (template === EEmailTemplate.ACCEPTED_WITHDRAWAL)
      return 'Approve withdrawal for <%= translate("$.productName") %>';
    if (template === EEmailTemplate.DOCUMENT_TO_SIGN)
      return 'Documents to be signed <%= translate("$.contractName") %>';
    if (template === EEmailTemplate.OTP_ADD_WALLET)
      return 'Wallet Confirmation - <%= translate("$.productName") %>';
    if (template === EEmailTemplate.OTP_REVOKER_WALLET)
      return 'Wallet Revoke Confirmation - <%= translate("$.productName") %>';
    if (template === EEmailTemplate.OTP_LINK_EMAIL)
      return 'Email Confirmation - <%= translate("$.productName") %>';
    if (template === EEmailTemplate.OTP_LINK_WALLET)
      return 'Wallet Confirmation - <%= translate("$.productName") %>';
    if (template === EEmailTemplate.REJECT_SIGN_DOCUMENT)
      return 'Contract Rejected - <%= translate("$.contractName") %>';
    if (template === EEmailTemplate.OTP_TWO_FA)
      return 'Enable Two-Factor Authentication (2FA) - Your <%= translate("$.productName") %> Account';
    if (template === EEmailTemplate.OTP_CHANGE_PASSWORD)
      return 'Reset Password - Your <%= translate("$.productName") %> Account';
    if (template === EEmailTemplate.SIGN_DOCUMENT_SUCCESS)
      return ' Contract successfully signed - <%= translate("$.contractName") %>';
    if (template === EEmailTemplate.ACCOUNT_TO_NEW_EMPLOYEE)
      return ' Invite Employee - <%= translate("$.productName") %>';
    if (template === EEmailTemplate.WELCOME_TO_CORPORATION)
      return 'Welcome to <%= translate("$.corporationName") %> - <%= translate("$.productName") %>';
    if (template === EEmailTemplate.SEND_CONTRACT_TO_EMPLOYEE_BY_ROLE)
      return 'Contract to be reviewed - <%= translate("$.contractName") %>';
    if (template === EEmailTemplate.CONTRACT_APPROVAL_NOTIFICATION)
      return 'Contract Approved - <%= translate("$.contractName") %>';
    if (template === EEmailTemplate.PACKAGE_TO_SIGN)
      return 'Contract Package to be signed - <%= translate("$.packageName") %>';
    throw new Error('CANNOT FIND SUBJECT');
  }

  private static async send(
    receiverId: number,
    template: EEmailTemplate,
    payload: object = {},
    receiverEmail?: string
  ) {
    const user = await this.getReceiver(receiverId);
    let toEmail = '';
    if (
      template == EEmailTemplate.OTP_LINK_EMAIL ||
      template == EEmailTemplate.OTP_TWO_FA
    ) {
      toEmail = receiverEmail;
    } else {
      toEmail = user.email;
    }
    const emailInput: IEmailInput = {
      template,
      subject: this.getSubjectByTemplate(template),
      locale: user.locale,
      from: Settings.POSTMARK_SENDER_EMAIL,
      payload: merge(payload, {
        name: `Customer`,
        productName: Settings.PRODUCT_NAME,
        emailSupport: Settings.EMAIL_SUPPORT
      }),
      to: toEmail
    };
    console.log(emailInput);

    if (configService.getEnv('EMAIL_PROVIDER') === 'POSTMARK')
      return Postmark.process(emailInput);
    if (configService.getEnv('EMAIL_PROVIDER') === 'MAILGUN')
      return Mailguns.process(emailInput);
    return Sendgrid.process(emailInput);
  }

  private static async sendDirectEmail(
    email: string,
    template: EEmailTemplate,
    payload: object = {}
  ) {
    const emailInput: IEmailInput = {
      template,
      subject: this.getSubjectByTemplate(template),
      locale: 'en_us',
      from: Settings.POSTMARK_SENDER_EMAIL,
      payload: merge(payload, {
        name: email,
        productName: Settings.PRODUCT_NAME
      }),
      to: email
    };
    if (configService.getEnv('EMAIL_PROVIDER') === 'POSTMARK')
      return Postmark.process(emailInput);
    if (configService.getEnv('EMAIL_PROVIDER') === 'MAILGUN')
      return Mailguns.process(emailInput);
    return Sendgrid.process(emailInput);
  }

  public static sendRegistrationConfirmationEmail(
    userId: number,
    payload: {
      code: string;
      email: string;
    }
  ) {
    //const registerConfirmationLink = this.getCallbackUrl(EEmailTemplate.REGISTRATION_CONFIRMATION, payload.code);
    const websiteLink = configService.getEnv('CLIENT_API_HOST');
    const payloadSend = {
      code: payload.code,
      email: payload.email,
      websiteLink: websiteLink,
      codeExpiredTime: String(
        Settings.REGISTER_VERIFICATION_EXPIRED_TIME / 60000 / 60
      )
    };
    return this.send(
      userId,
      EEmailTemplate.REGISTRATION_CONFIRMATION,
      payloadSend
    );
  }

  public static sendRecipientContract(
    userId: number,
    payload: {
      isNewUser: boolean;
      emaiNewUser: string;
      passwordNewUser: string;
      contractName: string;
      date: string;
      senderName: string;
      linkContract: string;
    }
  ) {
    return this.send(userId, EEmailTemplate.DOCUMENT_TO_SIGN, payload);
  }

  public static sendRecipientContractPackage(
    userId: number,
    payload: {
      isNewUser: boolean;
      emaiNewUser: string;
      passwordNewUser: string;
      packageName: string;
      date: string;
      senderName: string;
      linkPackage: string;
    }
  ) {
    return this.send(userId, EEmailTemplate.PACKAGE_TO_SIGN, payload);
  }

  //   public static sendWithdrawRequestEmail(userId: number, code: string) {
  //     const withrawRequestLink = this.getCallbackUrl(
  //       EEmailTemplate.REQUEST_WITHDRAW,
  //       code
  //     );
  //     const payload = {
  //       withrawRequestLink: code,
  //       code,
  //       codeExpiredTime: String(
  //         ServerConfig.config.withdrawRequestExpiration / 60000
  //       )
  //     };
  //     return this.send(userId, EEmailTemplate.REQUEST_WITHDRAW, payload); // in minutes
  //   }

  public static sendPasswordResetEmail(
    userId: number,
    payload: {
      code: string;
      email: string;
    }
  ) {
    const date = new Date().toUTCString();
    const payloadSend = {
      code: payload.code,
      email: payload.email,
      date: date,
      codeExpiredTime: String(
        Settings.FORGOT_PASSWORD_EXPIRED_TIME / 60000 / 60
      )
    };
    return this.send(userId, EEmailTemplate.PASSWORD_RESET, payloadSend);
  }

  public static sendForgotPinCodeEmail(
    userId: number,
    payload: { newPinCode: string }
  ) {
    return this.send(userId, EEmailTemplate.FORGOT_PIN_CODE, payload);
  }

  public static sendApproveKycEmail(userId: number) {
    return this.send(userId, EEmailTemplate.APPROVED_KYC);
  }

  public static sendRejectKycEmail(userId: number) {
    return this.send(userId, EEmailTemplate.REJECTED_KYC);
  }

  public static sendChangePinCodeNotificationEmail(userId: number) {
    return this.send(userId, EEmailTemplate.CHANGE_PIN_CODE);
  }

  public static sendBuyTokenConfirmationEmailToPresenter(
    userId: number,
    payload: { tokenValue: number; f1Email: string }
  ) {
    return this.send(
      userId,
      EEmailTemplate.BUY_TOKEN_CONFIRMATION_FOR_PRESENTER,
      payload
    );
  }

  public static sendRejectWithdrawEmail(
    userId: number,
    payload: { rejectReason: string }
  ) {
    return this.send(userId, EEmailTemplate.REJECTED_WITHDRAW, payload);
  }

  public static sendAcceptedWithdrawal(
    userId: number,
    payload: { coinName: string; value: string }
  ) {
    return this.send(userId, EEmailTemplate.ACCEPTED_WITHDRAWAL, payload);
  }

  //   public static sendOTP(
  //     userId: number,
  //     action: ESendAction,
  //     code: string,
  //     email?: string
  //   ) {
  //     let payload = {
  //       email,
  //       code,
  //       codeExpiredTime: String(Settings.SEND_OTP / 60000)
  //     };
  //     if (action === ESendAction.ADD_WALLET) {
  //       const template = EEmailTemplate.OTP_ADD_WALLET;
  //       return this.send(userId, template, payload);
  //     } else if (action === ESendAction.REVOKER_WALLET) {
  //       const template = EEmailTemplate.OTP_REVOKER_WALLET;
  //       return this.send(userId, template, payload);
  //     } else if (action === ESendAction.LINK_EMAIL) {
  //       const template = EEmailTemplate.OTP_LINK_EMAIL;
  //       return this.send(userId, template, payload, email);
  //     } else if (action === ESendAction.LINK_WALLET) {
  //       const template = EEmailTemplate.OTP_LINK_WALLET;
  //       return this.send(userId, template, payload);
  //     } else if (action === ESendAction.TWO_FA) {
  //       const template = EEmailTemplate.OTP_TWO_FA;
  //       payload.codeExpiredTime = String(
  //         Settings.CREATE_2FA_EXPIRED_TIME / 60000 / 60
  //       );
  //       return this.send(userId, template, payload, email);
  //     } else if (action === ESendAction.CHANGE_PASSWORD) {
  //       const template = EEmailTemplate.OTP_CHANGE_PASSWORD;
  //       payload.codeExpiredTime = String(
  //         Settings.CHANGE_PASSWORD_EXPIRED_TIME / 60000 / 60
  //       );
  //       return this.send(userId, template, payload);
  //     }
  //   }

  public static sendRejectSignDocument(
    userId: number,
    payload: {
      contractName: string;
      senderName: string;
      signerName: string;
      signerEmail: string;
      reason: string;
      date: string;
    }
  ) {
    return this.send(userId, EEmailTemplate.REJECT_SIGN_DOCUMENT, payload);
  }

  public static sendSignDocumentSuccessfully(
    userId: number,
    payload: {
      contractName: string;
      senderName: string;
      signerName: string;
      walletAddress: string;
      link: string;
      date: string;
    }
  ) {
    return this.send(userId, EEmailTemplate.SIGN_DOCUMENT_SUCCESS, payload);
  }

  private static getCallbackUrl(type: EEmailTemplate, code: string) {
    const CLIENT_API_HOST = configService.getEnv('CLIENT_API_HOST');
    if (type === EEmailTemplate.REGISTRATION_CONFIRMATION)
      return `${CLIENT_API_HOST}/user/verify-register/${code}`;
    if (type === EEmailTemplate.PASSWORD_RESET)
      return `${CLIENT_API_HOST}/lostPassword/${code}`;
    if (type === EEmailTemplate.REQUEST_WITHDRAW)
      return `${CLIENT_API_HOST}/withdraw/${code}`;
  }

  public static sendAccountNewEmployee(
    userId: number,
    payload: {
      emailNewEmployee: string;
      passwordNewEmployee: string;
      senderName: string;
      groupName: string;
      corporationName: string;
      linkWebsite: string;
    }
  ) {
    return this.send(userId, EEmailTemplate.ACCOUNT_TO_NEW_EMPLOYEE, payload);
  }

  public static sendWelcomeToCorporation(
    userId: number,
    payload: {
      isNewUser: boolean;
      emailNewEmployee: string;
      senderName: string;
      groupName: string;
      corporationName: string;
      linkWebsite: string;
    }
  ) {
    return this.send(userId, EEmailTemplate.WELCOME_TO_CORPORATION, payload);
  }

  public static sendContractToEmployeeByRole(
    userId: number,
    payload: {
      contractName: string;
      senderName: string;
      linkContract: string;
      emailEmployee: string;
      nameEmployee: string;
      date: string;
      toRole: string;
      reason?: string;
    }
  ) {
    return this.send(
      userId,
      EEmailTemplate.SEND_CONTRACT_TO_EMPLOYEE_BY_ROLE,
      payload
    );
  }

  public static contractApprovalNotification(
    userId: number,
    payload: {
      contractName: string;
      approverName: string;
      approvalStatus: string;
      linkContract: string;
      emailEmployee: string;
      date: string;
    }
  ) {
    return this.send(
      userId,
      EEmailTemplate.CONTRACT_APPROVAL_NOTIFICATION,
      payload
    );
  }
}
