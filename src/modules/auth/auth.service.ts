import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { LoginAuthAccountDto } from './dto/login-auth-account.dto';
import { SignUpAuthAccountDto } from './dto/signup-auth-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterVerification } from '../register-verification/entities/register-verification.entity';
import { EEmailTemplate, Mailer } from '../../common/email-helper/mailer';
import {
  EErrorDetail,
  EnumUserStatus,
  ESignInError
} from '../user/dto/enum.dto';
import { isNil } from 'lodash';
import { generateRandomCodeNumber } from '../../common/common.helper';
import { makeSure, mustTwoFa } from '../../common/server-error.helper';
import { compare, hash } from 'bcrypt';
import { RoleService } from '../role/role.service';
import { EnumRole } from '../../enums/role.enum';
import { configService } from '../../config/config.service';
import { TwoFa } from '../../common/twoFA.helper';
import { VerifyRegistrationAccountDto } from './dto/verify-registration.dto';
import { SignUpUseCase } from './use-cases/sign-up.use-case';
import { SignInUseCase } from './use-cases/sign-in.use-case';

@Injectable()
export class AuthService {
  private user: User;
  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private roleService: RoleService,
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase
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
  }
}
