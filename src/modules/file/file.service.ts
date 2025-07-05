import { Injectable } from '@nestjs/common';
import { UpdateFileDto } from './dto/update-file.dto';
import { CreateFileUseCase } from './use-cases/create-file.use-case';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileUseCase } from './use-cases/update-file.use-case';

@Injectable()
export class FileService {
  constructor(
    private readonly createFileUseCase: CreateFileUseCase,
    private readonly updateFileUseCase: UpdateFileUseCase
  ) {}

  async createFile(userId: number, input: CreateFileDto) {
    return this.createFileUseCase.execute(userId, input);
  }

  async updateFile(userId: number, input: UpdateFileDto) {
    return this.updateFileUseCase.execute(userId, input);
  }
}
