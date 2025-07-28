import { HttpException, HttpStatus } from '@nestjs/common';
import { configService } from '../../config/config.service';
import { IEmailDetail, IEmailInput } from './mailer';
import { EmailGenerator } from './email-generator.helper';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

export class GoogleAppMail {
  private transport: any;
  private oauth2Client: any;

  public constructor() {
    const configs = configService.getEmailServiceConfig();
    
    // Tạo OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      configs.gmailClientId,
      configs.gmailClientSecret,
      'https://developers.google.com/oauthplayground'
    );

    // Set credentials
    this.oauth2Client.setCredentials({
      refresh_token: configs.gmailRefreshToken,
      access_token: configs.gmailAccessToken
    });

    // Tạo transport với OAuth2
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

    // Xử lý token refresh
    this.transport.on('token', (token) => {
      console.log('New access token received:', token);
      this.oauth2Client.setCredentials({
        access_token: token.accessToken
      });
    });
  }

  private async refreshAccessToken() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      console.log('Access token refreshed successfully');
      
      // Cập nhật transport với access token mới
      this.transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: configService.getEmailServiceConfig().gmailUser,
          clientId: configService.getEmailServiceConfig().gmailClientId,
          clientSecret: configService.getEmailServiceConfig().gmailClientSecret,
          refreshToken: configService.getEmailServiceConfig().gmailRefreshToken,
          accessToken: credentials.access_token
        }
      });

      return credentials.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  async process(input: IEmailInput) {
    try {
      const emailDetail = await EmailGenerator.generate(input);
      return this.send(emailDetail);
    } catch (e) {
      console.error('Error in process:', e);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async send({ to, body, subject, from, attachments }: Partial<IEmailDetail>) {
    try {
      return await this.transport.sendMail({
        from,
        to,
        subject,
        html: body,
        attachments
      });
    } catch (error) {
      console.error('Google App Mail Error:', error);
      
      // nếu lỗi là invalid_grant, refresh token
      if (error.message && error.message.includes('invalid_grant')) {
        console.log('Attempting to refresh access token...');
        try {
          await this.refreshAccessToken();
          // test gửi lại email sau khi refresh token
          return await this.transport.sendMail({
            from,
            to,
            subject,
            html: body,
            attachments
          });
        } catch (refreshError) {
          console.error('Failed to refresh token and resend email:', refreshError);
          throw new HttpException(
            'Failed to send email: OAuth2 authentication failed. Please check your Google App credentials.',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }
      
      throw new HttpException(
        `Failed to send email via Google App Mail: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 