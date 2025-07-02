import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EErrorDetail, ESignInError } from '../../user/dto/enum.dto';
import { makeSure } from '../../../common/server-error.helper';
import { RoleService } from '../../role/role.service';

@Injectable()
export class LogOutUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private roleService: RoleService
  ) {}
}
