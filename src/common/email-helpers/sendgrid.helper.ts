import { HttpException, HttpStatus } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';
import { configService } from '../../config/config.service';
import { EmailGenerator } from './email-generator.helper';
import { IEmailDetail, IEmailInput } from './mailer';

export class Sendgrid {
  async process(input: IEmailInput) {
    try {
      const emailDetail = await EmailGenerator.generate(input);
      return this.send(emailDetail);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async send({ to, body, subject, from, attachments }: Partial<IEmailDetail>) {
    const configs = configService.getEmailServiceConfig();
    sendgrid.setApiKey(configs.sendGridApiKey);
    return sendgrid.send({
      from,
      to,
      html: body,
      subject,
      attachments
    });
  }
}
