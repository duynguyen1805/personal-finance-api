import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { File } from './entities/file.entity';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { CreateFileUseCase } from './use-cases/create-file.use-case';
import { UpdateFileUseCase } from './use-cases/update-file.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([File, User])],
  controllers: [FileController],
  providers: [FileService, CreateFileUseCase, UpdateFileUseCase],
  exports: [FileService]
})
export class FileModule {}
