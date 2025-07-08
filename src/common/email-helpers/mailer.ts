import { merge } from 'lodash';
import { configService } from '../../config/config.service';
import { Sendgrid } from './sendgrid.helper';
import { SMTP } from './smtp.helper';
import { User } from 'src/modules/user/entities/user.entity';
const moment = require('moment');

export interface IEmailInput {
  template: string;
  subject: string;
  payload: any;
  from: string;
  to: string;
  attachments: any[];
}

export interface IEmailDetail {
  subject: string;
  body: string;
  from: string;
  to: string;
  attachments: any[];
}

export enum EEmailTemplate {
  IMPORT_TIME_OFF_BALANCES = 'time-off/import-time-off-balances',
  EXPORT_TIME_OFF_BALANCES = 'time-off/export-time-off-balances',
  EXPORT_TIME_OFF_REQUESTS = 'time-off/export-time-off-requests',
  CHANGE_STATUS_TIME_OFF_REQUEST = 'time-off/change-status-time-off-request',
  REGISTRATION_CONFIRMATION = 'registration-confirmation'
}

export interface IEmailCotent {
  subject: string;
  template: string;
}

export enum EEmailProvider {
  SMTP = 'SMTP',
  SENDGRID = 'SENDGRID'
}

export class Mailer {
  private smtp: SMTP;
  private sendgrid: Sendgrid;

  public constructor() {
    // this.smtp = new SMTP();
    // this.sendgrid = new Sendgrid();
  }

  getSubjectByTemplate(template: EEmailTemplate): string {
    switch (template) {
      case EEmailTemplate.IMPORT_TIME_OFF_BALANCES:
        return 'Leave balance Import';
      case EEmailTemplate.EXPORT_TIME_OFF_BALANCES:
        return 'Timeoff Balance Export';
      case EEmailTemplate.EXPORT_TIME_OFF_REQUESTS:
        return 'Export time off requests';
      default:
        throw new Error('Cannot find subject.');
    }
  }

  async send(
    subject: string,
    user: User,
    template: EEmailTemplate,
    payload: object = {},
    attachments: any = []
  ) {
    const configs = configService.getEmailServiceConfig();
    if (configs.isSendEmail) {
      const emailInput: IEmailInput = {
        template,
        subject: subject ? subject : this.getSubjectByTemplate(template),
        from: configs.senderName,
        payload: merge(payload, {
          baseUrl: process.env.BASE_URL,
          freshNicWebUrl: process.env.FRESH_NIC_WEB_URL,
          moment,
          fullname: `Anonymous`,
          profileUrl: 'https://google.com.vn',
          androidAppUrl: '',
          iosAppUrl: ''
        }),
        to: 'Anonymous',
        attachments
      };

      // switch (configs.emailProvider) {
      //   case EEmailProvider.SENDGRID:
      //     return this.sendgrid.process(emailInput);
      //   case EEmailProvider.SMTP:
      //     return this.smtp.process(emailInput);
      // }
    }
  }
}
