import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { configService } from '../../config/config.service';

export class TwoFa {
  static async generateSecret(email: string) {
    const CLIENT_API_HOST = configService.getEnv('CLIENT_API_HOST');
    return await speakeasy.generateSecret({
      name: CLIENT_API_HOST + ' (' + email + ')'
    });
  }

  static async generateQr(secret: any) {
    return await QRCode.toDataURL(secret.otpauth_url);
  }

  // static verifyTwoFa(code: string, base32secret: string) {
  //   return speakeasy.totp.verify({
  //     secret: base32secret,
  //     encoding: 'base32',
  //     token: code
  //   });
  // }

  static verifyTwoFa(code: string, base32secret: string) {
    let formattedCode = code;
    if (/^\d{6}$/.test(code)) {
      formattedCode = code.slice(0, 3) + ' ' + code.slice(3);
    }
    return speakeasy.totp.verify({
      secret: base32secret,
      encoding: 'base32',
      token: formattedCode
    });
  }
}
