import { Mailer, EEmailTemplate } from './mailer';
import { User } from '../../modules/user/entities/user.entity';

/**
 * Example usage of Google App Mail
 * This file demonstrates how to use the new Google App Mail functionality
 */

export class GoogleAppMailExample {
  constructor(private readonly mailer: Mailer) {}

  /**
   * Example: Send registration confirmation email
   */
  async sendRegistrationEmail(user: User, verificationCode: string) {
    try {
      await this.mailer.send(
        'Confirm Your Registration',
        user,
        EEmailTemplate.REGISTRATION_CONFIRMATION,
        {
          code: verificationCode,
          email: user.email,
          websiteLink: process.env.BASE_URL,
          codeExpiredTime: '24' // hours
        }
      );
      console.log('Registration email sent successfully');
    } catch (error) {
      console.error('Failed to send registration email:', error);
      throw error;
    }
  }

  /**
   * Example: Send OTP for two-factor authentication
   */
  async sendOTPEmail(user: User, otpCode: string) {
    try {
      await this.mailer.send(
        'Two Factor Authentication Code',
        user,
        EEmailTemplate.OTP_TWO_FA,
        {
          code: otpCode,
          email: user.email
        }
      );
      console.log('OTP email sent successfully');
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw error;
    }
  }

  /**
   * Example: Send custom email with attachment
   */
  async sendCustomEmail(user: User, customData: any, attachments: any[] = []) {
    try {
      await this.mailer.send(
        'Custom Email Subject',
        user,
        EEmailTemplate.REGISTRATION_CONFIRMATION, // Using existing template
        {
          ...customData,
          email: user.email
        },
        attachments
      );
      console.log('Custom email sent successfully');
    } catch (error) {
      console.error('Failed to send custom email:', error);
      throw error;
    }
  }
}

/**
 * Usage in a service:
 * 
 * import { GoogleAppMailExample } from '../common/email-helpers/google-app-mail-example';
 * 
 * @Injectable()
 * export class AuthService {
 *   constructor(
 *     private readonly mailer: Mailer,
 *     private readonly googleAppMailExample: GoogleAppMailExample
 *   ) {}
 * 
 *   async registerUser(userData: any) {
 *     const user = await this.createUser(userData);
 *     const verificationCode = this.generateVerificationCode();
 *     
 *     // Send registration email using Google App Mail
 *     await this.googleAppMailExample.sendRegistrationEmail(user, verificationCode);
 *     
 *     return user;
 *   }
 * }
 */ 