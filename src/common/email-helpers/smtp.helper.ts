import { configService } from '../../config/config.service';
import * as nodemailer from 'nodemailer';
import { IEmailDetail, IEmailInput } from './mailer';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EmailGenerator } from './email-generator.helper';

export class SMTP {
  private configs: any;
  private transport: any;

  public constructor() {
    this.configs = configService.getEmailServiceConfig();
    this.transport = nodemailer.createTransport({
      host: this.configs.smtpHost,
      port: Number(this.configs.smtpPort),
      auth: {
        user: this.configs.smtpUser,
        pass: this.configs.smtpPassword
      }
    });
  }

  async process(input: IEmailInput) {
    try {
      const emailDetail = await EmailGenerator.generate(input);
      this.send(emailDetail);
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
      console.log(e);
    }
  }
}
