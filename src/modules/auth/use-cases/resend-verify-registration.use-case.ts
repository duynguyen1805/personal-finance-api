import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EEmailTemplate, Mailer } from '../../../common/email-helpers/mailer-v2';
import { User } from '../../user/entities/user.entity';
import {
  EErrorDetail,
  EnumUserStatus,
  ESignInError
} from '../../user/dto/enum.dto';
import { generateRandomCodeNumber } from '../../../common/helpers/common.helper';
import {
  makeSure,
  mustExist
} from '../../../common/helpers/server-error.helper';
import { RegisterVerification } from '../../register-verification/entities/register-verification.entity';

@Injectable()
export class ResendVerifyRegistrationUseCase {
  private user: User;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RegisterVerification)
    private registerVerification: Repository<RegisterVerification>
  ) {}

  async validateUser(userId: number, email: string) {
    this.user = await this.userRepository.findOne({
      id: userId,
      email: email
    });
    mustExist(
      this.user,
      ESignInError.CANNOT_FIND_USER,
      EErrorDetail.CANNOT_FIND_USER
    );
    makeSure(
      this.user.status === EnumUserStatus.INACTIVE,
      ESignInError.INVALID_USER_STATUS,
      EErrorDetail.INVALID_USER_STATUS
    );
  }

  async resendVerifyRegistration(userId: number, email: string) {
    await this.validateUser(userId, email);
    const code = generateRandomCodeNumber(6);
    await this.saveRegisterVerification(userId, code);
    await Mailer.sendRegistrationConfirmationEmail(
      this.user.id,
      { code, email: this.user.email }
    );
    return;
  }

  async saveRegisterVerification(userId: number, code: string) {
    await this.registerVerification.delete({ userId });
    await this.registerVerification.create({
      userId,
      code
    });
  }
}
