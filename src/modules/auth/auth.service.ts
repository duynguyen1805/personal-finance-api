import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { LoginAuthAccountDto } from './dto/login-auth-account.dto';
import { SignUpAuthAccountDto } from './dto/signup-auth-account.dto';

@Injectable()
export class AuthService {
  private user: User;
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private httpService: HttpService
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
    const userRegistered = await this.userService.signUpAccount(user);

    return this.login({
      email: userRegistered.email,
      password: user.password
    });
  }
}
