import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EEmailTemplate, Mailer } from 'src/common/email-helper/mailer';
import { User } from '../../user/entities/user.entity';
import { SignUpAuthAccountDto } from '../dto/signup-auth-account.dto';
import {
  EErrorDetail,
  EnumUserStatus,
  ESignInError
} from '../../../modules/user/dto/enum.dto';
import { generateRandomCodeNumber } from '../../../common/common.helper';
import { makeSure } from '../../../common/server-error.helper';
import { isNil } from 'lodash';
import { RegisterVerification } from '../../../modules/register-verification/entities/register-verification.entity';
import { hash } from 'bcrypt';

@Injectable()
export class SignUpUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RegisterVerification)
    private registerVerification: Repository<RegisterVerification>,
    private Mailer: Mailer
  ) {}

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
