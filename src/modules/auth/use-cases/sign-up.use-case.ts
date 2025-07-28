import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EEmailTemplate,
  Mailer
} from '../../../common/email-helpers/mailer-v2';
import { User } from '../../user/entities/user.entity';
import { SignUpAuthAccountDto } from '../dto/signup-auth-account.dto';
import {
  EErrorDetail,
  EnumUserStatus,
  ESignInError
} from '../../../modules/user/dto/enum.dto';
import { generateRandomCodeNumber } from '../../../common/helpers/common.helper';
import { makeSure } from '../../../common/helpers/server-error.helper';
import { isNil } from 'lodash';
import { RegisterVerification } from '../../../modules/register-verification/entities/register-verification.entity';
import { hash } from 'bcrypt';
import { RoleService } from '../../../modules/role/role.service';
import { EnumRole } from '../../../enums/role.enum';

@Injectable()
export class SignUpUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RegisterVerification)
    private registerVerification: Repository<RegisterVerification>,
    private readonly roleService: RoleService
  ) {}

  async signUpAccount(user: SignUpAuthAccountDto) {
    const currentUserWithRegisterEmail =
      await this.getCurrentUserWithRegisterEmail(user.email);

    if (
      currentUserWithRegisterEmail &&
      currentUserWithRegisterEmail.status === EnumUserStatus.INACTIVE
    ) {
      makeSure(
        isNil(currentUserWithRegisterEmail),
        ESignInError.USER_EXIST,
        EErrorDetail.USER_EXIST
      );
    } else {
      const userRegistered = await this.saveUser(user);
      const code = generateRandomCodeNumber(6);
      await Mailer.sendRegistrationConfirmationEmail(userRegistered.id, {
        code,
        email: userRegistered.email
      });
      const registerVerification = await this.saveRegisterVerification(
        code,
        userRegistered
      );
      console.log('registerVerification', registerVerification);
      return userRegistered;
    }

    return null;
  }

  async getCurrentUserWithRegisterEmail(email: string) {
    const filter = { email: email };
    return await this.userRepository.findOne(filter);
  }

  async saveRegisterVerification(code: string, { id: userId }: User) {
    await this.registerVerification.findOne({ userId });
    await this.registerVerification.delete({ userId });
    return await this.registerVerification.save({
      userId,
      code
    });
  }

  async saveUser(user: SignUpAuthAccountDto) {
    const passwordHash = await hash(user.password, 8);
    const role = await this.roleService.findOneByName(EnumRole.USER);
    return await this.userRepository.save({
      ...user,
      passwordHash: passwordHash,
      status: EnumUserStatus.INACTIVE,
      accountType: 'ACTIVE',
      roles: [role]
    });
  }
}
