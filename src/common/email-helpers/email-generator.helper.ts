import * as ejs from 'ejs';
import { IEmailDetail, IEmailInput } from './mailer';
import * as path from 'path';

export class EmailGenerator {
  static async generate(input: IEmailInput): Promise<IEmailDetail> {
    const { template, from, to, payload, attachments } = input;
    const body = await ejs.renderFile<string>(
      path.join(
        path.resolve(__dirname, '../../../'),
        'templates',
        'email',
        `${template}.ejs`
      ),
      {
        ...payload
      }
    );

    return {
      subject: ejs.render(input.subject, { ...payload }),
      body,
      from,
      to,
      attachments
    };
  }
}
