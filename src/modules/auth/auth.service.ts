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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    // private httpService: HttpService,
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly verifyRegistrationUseCase: VerifyRegistrationUseCase,
    private readonly resendVerifyRegistrationUseCase: ResendVerifyRegistrationUseCase
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

    return {
      token: this.jwtService.sign({
        data: payload
      })
    };
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
}
