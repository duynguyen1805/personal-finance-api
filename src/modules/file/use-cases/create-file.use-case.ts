import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { mustExist } from '../../../common/helpers/server-error.helper';
import { File } from '../entities/file.entity';
import { EErrorFile, EErrorDetail } from '../interface/enum.interface';
import { CreateFileDto } from '../dto/create-file.dto';

@Injectable()
export class CreateFileUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(File)
    private fileRepository: Repository<File>
  ) {}

  async execute(userId: number, dto: CreateFileDto) {
    await this.validateUser(userId);
    dto.userUploadId = userId;
    return await this.fileRepository.save({
      ...dto
    });
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({ id: userId });
    mustExist(user, EErrorFile.CANNOT_FIND_USER, EErrorDetail.CANNOT_FIND_USER);
  }
}
