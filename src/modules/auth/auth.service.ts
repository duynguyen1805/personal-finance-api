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
import { makeSure } from '../../common/server-error.helper';
import { hash } from 'bcrypt';

@Injectable()
export class AuthService {
  private user: User;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RegisterVerification)
    private registerVerification: Repository<RegisterVerification>,
    private userService: UserService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private Mailer: Mailer
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
    const user = await this.userService.signIn(reqUser, isAdminLogin);

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

  async signUp(user: SignUpAuthAccountDto) {
    const userRegistered = await this.signUpAccount(user);

    return this.login({
      email: userRegistered.email,
      password: user.password
    });
  }

  async signUpAccount(user: SignUpAuthAccountDto) {
    const currentUserWithRegisterEmail =
      await this.getCurrentUserWithRegisterEmail(user.email);

    if (
      currentUserWithRegisterEmail &&
      currentUserWithRegisterEmail.status === EnumUserStatus.INACTIVE
    ) {
      const code = generateRandomCodeNumber(6);
      this.Mailer.send(
        this.Mailer.getSubjectByTemplate(
          EEmailTemplate.REGISTRATION_CONFIRMATION
        ),
        currentUserWithRegisterEmail,
        EEmailTemplate.REGISTRATION_CONFIRMATION,
        { code }
      );
      await this.saveRegisterVerification(code, currentUserWithRegisterEmail);
      return currentUserWithRegisterEmail;
    } else {
      makeSure(
        isNil(currentUserWithRegisterEmail),
        ESignInError.USER_EXIST,
        EErrorDetail.USER_EXIST
      );
    }

    const userRegistered = await this.saveUser(user);
    return userRegistered;
  }

  async getCurrentUserWithRegisterEmail(email) {
    const filter = { email: email };
    return this.userRepository.findOne(filter);
  }

  async saveRegisterVerification(code: string, { id: userId }: User) {
    await this.registerVerification.findOne({ userId });
    await this.registerVerification.delete({ userId });
    return this.registerVerification.create({
      userId,
      code
    });
  }

  async saveUser(user: SignUpAuthAccountDto) {
    const passwordHash = await hash(user.password, 8);
    return this.userRepository.save({
      ...user,
      paaswordHash: passwordHash,
      status: EnumUserStatus.INACTIVE
    });
  }
}
