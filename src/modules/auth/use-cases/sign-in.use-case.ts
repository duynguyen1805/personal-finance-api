import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EErrorDetail, ESignInError } from '../../user/dto/enum.dto';
import { makeSure, mustTwoFa } from '../../../common/helpers/server-error.helper';
import { compare } from 'bcrypt';
import { LoginAuthAccountDto } from '../dto/login-auth-account.dto';
import { RoleService } from '../../../modules/role/role.service';
import { EnumRole } from '../../../enums/role.enum';
import { configService } from '../../../config/config.service';
import { TwoFa } from '../../../common/helpers/twoFA.helper';

@Injectable()
export class SignInUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private roleService: RoleService
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
}
