import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EErrorDetail, EUserServiceError } from '../../user/dto/enum.dto';
import { mustExist } from '../../../common/server-error.helper';
// import { RoleService } from '../../role/role.service';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User> // private roleService: RoleService
  ) {}

  async execute(userId: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ id: userId });
    mustExist(
      user,
      EUserServiceError.CANNOT_FIND_USER,
      EErrorDetail.CANNOT_FIND_USER
    );
    return this.userRepository.update(userId, dto);
  }
}
