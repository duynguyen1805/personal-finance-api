import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import {
  makeSure,
  mustExist,
  mustTwoFa
} from '../../../common/server-error.helper';
import { RegisterVerification } from '../../register-verification/entities/register-verification.entity';
import { EConfirmRegisterError, EErrorDetail } from '../dto/enum.dto';
import { isExpired } from '../../../common/common.helper';
import { Settings } from '../../../settings';
import { EnumUserStatus } from '../../../modules/user/dto/enum.dto';

@Injectable()
export class VerifyRegistrationUseCase {
  private user: User;
  private registerVerification: RegisterVerification;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RegisterVerification)
    private registerVerificationRepository: Repository<RegisterVerification>
  ) {}

  async verifyRegistration(email: string, code: string) {
    this.registerVerification =
      await this.registerVerificationRepository.findOne({ code: code });
    this.enforceRegisterVerificationExists(email);
    this.enforceRegisterIsInValidTime();
    await this.markUserStatusIsEmailVerified();
    await this.removeCurrentRegisterVerification();
  }

  async enforceRegisterVerificationExists(email: string) {
    mustExist(
      this.registerVerification,
      EConfirmRegisterError.CANNOT_FIND_VERIFICATION_CODE,
      EErrorDetail.CANNOT_FIND_VERIFICATION_CODE
    );
    this.user = await this.userRepository.findOne({
      id: this.registerVerification.userId,
      email: email
    });
  }

  enforceRegisterIsInValidTime() {
    const isRegisterExpired = isExpired(
      this.registerVerification.createdAt,
      Settings.REGISTER_VERIFICATION_EXPIRED_TIME
    );
    makeSure(
      !isRegisterExpired,
      EConfirmRegisterError.REGISTER_CODE_EXPIRED,
      EErrorDetail.REGISTER_CODE_EXPIRED
    );
  }

  async markUserStatusIsEmailVerified() {
    if (this.user) {
      return await this.userRepository.update(
        { id: this.registerVerification.userId },
        { status: EnumUserStatus.ACTIVE }
      );
    } else {
      mustExist(
        this.user,
        EConfirmRegisterError.CANNOT_FIND_USER,
        EErrorDetail.CANNOT_FIND_USER
      );
    }
    return null;
  }

  async removeCurrentRegisterVerification() {
    const user = await this.userRepository.findOne({
      id: this.registerVerification.userId
    });
    if (user) {
      return await this.registerVerificationRepository.delete({
        userId: this.registerVerification.userId
      });
    }
    return null;
  }
}
