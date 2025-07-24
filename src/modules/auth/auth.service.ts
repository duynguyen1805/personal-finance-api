import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { LoginAuthAccountDto } from './dto/login-auth-account.dto';
import { SignUpAuthAccountDto } from './dto/signup-auth-account.dto';
import { VerifyRegistrationAccountDto } from './dto/verify-registration.dto';
import { SignUpUseCase } from './use-cases/sign-up.use-case';
import { SignInUseCase } from './use-cases/sign-in.use-case';
import { VerifyRegistrationUseCase } from './use-cases/verify-registration.use-case';
import { ResendVerifyRegistrationAccountDto } from './dto/resend-verify-registration.dto';
import { ResendVerifyRegistrationUseCase } from './use-cases/resend-verify-registration.use-case';
import { CacheService } from '../cache/cache.service';
import { LogOutUseCase } from './use-cases/logout.use-case';
import { UserService } from '../user/user.service';
import { TwoFa } from '../../common/helpers/twoFA.helper';
import { Mailer, EEmailTemplate } from '../../common/email-helpers/mailer';
import { ERedisKey } from '../../database/redis';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    // private httpService: HttpService,
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly verifyRegistrationUseCase: VerifyRegistrationUseCase,
    private readonly resendVerifyRegistrationUseCase: ResendVerifyRegistrationUseCase,
    private readonly logoutUseCase: LogOutUseCase,
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
    private readonly mailer: Mailer
  ) {}

  async signIn(user: LoginAuthAccountDto, isAdminLogin = false) {
    const validateResult = await this.signInUseCase.validateUser(
      user.email,
      user.password,
      user?.isRememberMe,
      user?.twoFaCode,
      isAdminLogin
    );
    if (!validateResult) {
      throw new UnauthorizedException();
    }
    const payload = {
      email: validateResult.email,
      id: validateResult.id,
      permissions: validateResult?.roles
        ? validateResult.roles
            .map((role) => JSON.parse(role.permissions))
            .flat(1)
        : [],
      profile: validateResult.profile
    };

    const token = this.jwtService.sign({ data: payload });
    const refreshToken = this.jwtService.sign(
      { data: payload },
      { expiresIn: '7d' }
    );

    return {
      token,
      refreshToken,
      user: validateResult
    };
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const decoded = this.jwtService.verify(oldRefreshToken);
      const payload = decoded.data;
      // Có thể kiểm tra blacklist hoặc revoked token ở đây nếu cần
      const isBlacklisted = await this.cacheService.get(
        `${ERedisKey.BLACKLIST_TOKEN_PREFIX}${oldRefreshToken}`
      );
      if (isBlacklisted) {
        throw new UnauthorizedException('Refresh token is blacklisted');
      }
      const isBlacklistedRefreshToken = await this.cacheService.get(
        `${ERedisKey.BLACKLIST_TOKEN_PREFIX}${oldRefreshToken}`
      );
      if (isBlacklistedRefreshToken) {
        throw new UnauthorizedException('Refresh token is blacklisted');
      }
      const token = this.jwtService.sign({ data: payload });
      const refreshToken = this.jwtService.sign(
        { data: payload },
        { expiresIn: '7d' }
      );
      return {
        token,
        refreshToken
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signUp(user: SignUpAuthAccountDto) {
    const userRegistered = await this.signUpUseCase.signUpAccount(user);

    return this.signIn({
      email: userRegistered.email,
      password: user.password
    });
  }

  async verifyRegistration(input: VerifyRegistrationAccountDto) {
    const { email, code } = input;
    return this.verifyRegistrationUseCase.verifyRegistration(email, code);
  }

  async resendVerifyRegistration(
    input: ResendVerifyRegistrationAccountDto,
    userId: number
  ) {
    const { email } = input;
    return this.resendVerifyRegistrationUseCase.resendVerifyRegistration(
      userId,
      email
    );
  }

  async logOut(token: string, refreshToken: string) {
    return this.logoutUseCase.addTokenToBlackList(token, refreshToken);
  }

  async generate2FASecret(userId: number, email: string) {
    const secret = await TwoFa.generateSecret(email);
    const qr = await TwoFa.generateQr(secret);
    await this.userService.updateUserInfo(userId, {
      twoFactorAuthSecret: secret.base32,
      isTwoFactorAuthEnabled: false,
      timeActiveTwoFactorAuth: null
    });
    return { secret: secret.base32, otpauth_url: secret.otpauth_url, qr };
  }

  async verify2FA(userId: number, code: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.twoFactorAuthSecret)
      throw new UnauthorizedException('2FA not initialized');
    const isValid = TwoFa.verifyTwoFa(code, user.twoFactorAuthSecret);
    return { isValid };
  }

  async enable2FA(userId: number, code: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.twoFactorAuthSecret)
      throw new UnauthorizedException('2FA not initialized');
    const isValid = TwoFa.verifyTwoFa(code, user.twoFactorAuthSecret);
    if (!isValid) throw new UnauthorizedException('Invalid 2FA code');
    await this.userService.updateUserInfo(userId, {
      lastName: undefined,
      firstName: undefined,
      avatar: undefined,
      isTwoFactorAuthEnabled: true,
      timeActiveTwoFactorAuth: new Date()
    });
    return { success: true };
  }

  async disable2FA(userId: number, code: string, emailOtp?: string) {
    if (emailOtp) {
      const cachedOtp = await this.cacheService.get(
        `disable-2fa-otp:${userId}`
      );
      if (!cachedOtp || cachedOtp !== emailOtp) {
        throw new UnauthorizedException('Invalid or expired email OTP');
      }
      await this.cacheService.del(`disable-2fa-otp:${userId}`);
    }
    const user = await this.userService.findById(userId);
    if (!user || !user.twoFactorAuthSecret)
      throw new UnauthorizedException('2FA not initialized');
    const isValid = TwoFa.verifyTwoFa(code, user.twoFactorAuthSecret);
    if (!isValid) throw new UnauthorizedException('Invalid 2FA code');
    await this.userService.updateUserInfo(userId, {
      isTwoFactorAuthEnabled: false,
      twoFactorAuthSecret: null,
      timeActiveTwoFactorAuth: null
    });
    return { success: true };
  }

  async sendDisable2FAOtp(userId: number, email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheService.setWithTTL(`disable-2fa-otp:${userId}`, otp, 300);
    const user = await this.userService.findById(userId);
    await this.mailer.send(
      this.mailer.getSubjectByTemplate(EEmailTemplate.OTP_TWO_FA),
      user,
      EEmailTemplate.OTP_TWO_FA,
      {
        code: otp,
        email
      }
    );
    return { success: true };
  }

  async get2FAStatus(userId: number) {
    const user = await this.userService.findById(userId);
    return {
      isTwoFactorAuthEnabled: user?.isTwoFactorAuthEnabled || false,
      timeActiveTwoFactorAuth: user?.timeActiveTwoFactorAuth || null
    };
  }
}
