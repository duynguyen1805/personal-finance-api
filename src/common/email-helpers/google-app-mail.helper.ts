import { HttpException, HttpStatus } from '@nestjs/common';
import { configService } from '../../config/config.service';
import { IEmailDetail, IEmailInput } from './mailer';
import { EmailGenerator } from './email-generator.helper';
import * as nodemailer from 'nodemailer';

export class GoogleAppMail {
  private transport: any;

  public constructor() {
    const configs = configService.getEmailServiceConfig();
    this.transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: configs.gmailUser,
        clientId: configs.gmailClientId,
        clientSecret: configs.gmailClientSecret,
        refreshToken: configs.gmailRefreshToken,
        accessToken: configs.gmailAccessToken
      }
    });
  }

  async process(input: IEmailInput) {
    try {
      const emailDetail = await EmailGenerator.generate(input);
      return this.send(emailDetail);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async send({ to, body, subject, from, attachments }: Partial<IEmailDetail>) {
    try {
      return this.transport.sendMail({
        from,
        to,
        subject,
        html: body,
        attachments
      });
    } catch (e) {
      console.log('Google App Mail Error:', e);
      throw new HttpException('Failed to send email via Google App Mail', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 