import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  private user: User;
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private httpService: HttpService
  ) {}

  async validateUser(
    walletAddress: string,
    deadline: number,
    sig: string,
    isAdminLogin = false
  ): Promise<any> {
    const reqUser: LoginAuthDto = {
      walletAddress,
      deadline,
      sig
    };
    const user = await this.userService.signIn(reqUser, isAdminLogin);

    if (!user) {
      return null;
    }
    const { ...result } = user;
    return result;
  }

  async login(user: any, isAdminLogin = false) {
    const validateResult = await this.validateUser(
      user.walletAddress,
      user.deadline,
      user.sig,
      isAdminLogin
    );
    if (!validateResult) {
      throw new UnauthorizedException();
    }
    const payload = {
      walletAddress: validateResult.walletAddress,
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
}
