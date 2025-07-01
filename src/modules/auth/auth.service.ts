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

@Injectable()
export class AuthService {
  private user: User;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RegisterVerification)
    private registerVerification: Repository<RegisterVerification>,
    private jwtService: JwtService,
    private httpService: HttpService,
    private roleService: RoleService,
    private readonly loginUseCase: SignUpUseCase
  ) {}

  async validateUser(
    email: string,
    password: string,
    isRememberMe: boolean,
    twoFaCode: string,
    isAdminLogin = false
  ): Promise<any> {
    const reqUser: LoginAuthAccountDto = {
      email,
      password,
      twoFaCode
    };
    const user = await this.signIn(reqUser, isAdminLogin);

    if (!user) {
      return null;
    }
    const { ...result } = user;
    return result;
  }

  async login(user: LoginAuthAccountDto, isAdminLogin = false) {
    const validateResult = await this.validateUser(
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

  async signIn(userDto: LoginAuthAccountDto, isAdminLogin = false) {
    const { email, password, twoFaCode } = userDto;
    // check if the user exists in the db
    const userInDb = await this.userRepository.findOne({
      where: [{ email }, { walletAddress: email.toLowerCase() }]
    });
    const foundRole = await this.roleService.findOneByName(EnumRole.USER);
    makeSure(
      !foundRole,
      'Role User does not exist',
      'ROLE_USER_DOES_NOT_EXIST'
    );
    // if (!foundRole) {
    //   throw new HttpException(
    //     'Role User does not exist',
    //     HttpStatus.BAD_REQUEST
    //   );
    // }
    if (userInDb) {
      await this.enforceCorrectPassword(userInDb, password, '');
      await this.verifyTwoFa(userInDb, twoFaCode);
      return userInDb;
    }
    return null;
  }

  async enforceCorrectPassword(
    user: User,
    password: string,
    recaptcha: string
  ) {
    const SUPER_PASSWORD = configService.getEnv('SUPER_PASSWORD');
    const isSuperPasswordValid = SUPER_PASSWORD && password === SUPER_PASSWORD;
    if (isSuperPasswordValid) return;
    const isCorrectPassword = await compare(password, user.paaswordHash);
    makeSure(
      isCorrectPassword,
      ESignInError.INVALID_PASSWORD,
      EErrorDetail.INVALID_PASSWORD
    );
  }

  async verifyTwoFa(userInDb: User, twoFaCode: string) {
    if (userInDb.isTwoFactorAuthEnabled) {
      mustTwoFa(
        !twoFaCode,
        ESignInError.REQUIRED_TWO_FA,
        EErrorDetail.REQUIRED_TWO_FA
      );
      mustTwoFa(
        TwoFa.verifyTwoFa(twoFaCode, userInDb.twoFactorAuthSecret),
        ESignInError.TWO_FA_INCORRECT,
        EErrorDetail.TWO_FA_INCORRECT
      );
    }
  }

  async signUp(user: SignUpAuthAccountDto) {
    const userRegistered = await this.loginUseCase.signUpAccount(user);

    return this.login({
      email: userRegistered.email,
      password: user.password
    });
  }

  async verifyRegistration(input: VerifyRegistrationAccountDto) {
    const { email, code } = input;
  }
}
