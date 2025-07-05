import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { mustExist } from '../../../common/helpers/server-error.helper';
// import { RoleService } from '../../role/role.service';
import { UpdateFileDto } from '../dto/update-file.dto';
import { File } from '../entities/file.entity';
import { EErrorFile, EErrorDetail } from '../interface/enum.interface';

@Injectable()
export class UpdateFileUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(File)
    private fileRepository: Repository<File>
  ) {}

  async execute(userId: number, dto: UpdateFileDto) {
    await this.validateUser(userId);
    dto.userUploadId = userId;
    return await this.fileRepository.update(userId, {
      ...dto
    });
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({ id: userId });
    mustExist(user, EErrorFile.CANNOT_FIND_USER, EErrorDetail.CANNOT_FIND_USER);
  }
}
