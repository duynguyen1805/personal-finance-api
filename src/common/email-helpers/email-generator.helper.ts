import * as ejs from 'ejs';
import { IEmailDetail, IEmailInput } from './mailer';
import * as path from 'path';
import * as fs from 'fs';

export class EmailGenerator {
  private static getTemplatePath(template: string): string {
    // Try multiple possible paths for template files
    const possiblePaths = [
      // Development path (from src directory)
      path.join(process.cwd(), 'templates', 'email', `${template}.ejs`),
      // Production path (from dist directory)
      path.join(process.cwd(), 'dist', 'templates', 'email', `${template}.ejs`),
      // Alternative production path
      path.join(__dirname, '..', '..', '..', 'templates', 'email', `${template}.ejs`),
      // Fallback path
      path.join(__dirname, '..', '..', '..', '..', 'templates', 'email', `${template}.ejs`)
    ];

    for (const templatePath of possiblePaths) {
      if (fs.existsSync(templatePath)) {
        console.log(`Found template at: ${templatePath}`);
        return templatePath;
      }
    }

    // If no template found, throw error with all attempted paths
    throw new Error(
      `Template file not found: ${template}.ejs. Tried paths: ${possiblePaths.join(', ')}`
    );
  }

  static async generate(input: IEmailInput): Promise<IEmailDetail> {
    const { template, from, to, payload, attachments } = input;
    
    const templatePath = this.getTemplatePath(template);
    
    const body = await ejs.renderFile<string>(
      templatePath,
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
