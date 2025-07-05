import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '../permission/permissison.guard';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Permissions } from '../permission/permission.decorator';
import { User } from '../user/entities/user.entity';
import { FileService } from './file.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { CreateFileDto } from './dto/create-file.dto';

@ApiTags('file')
@Controller('file')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseGuards(PermissionGuard)
export class FileController {
  constructor(
    private readonly fileService: FileService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Post('create-file')
  // @Permissions('UPLOAD_FILE')
  createFile(@Body() dto: CreateFileDto) {
    const user = this.request.user as User;
    dto.userUploadId = user.id;
    return this.fileService.createFile(user.id, dto);
  }

  @Post('update-file')
  // @Permissions('UPLOAD_FILE')
  updateFile(@Body() dto: UpdateFileDto) {
    const user = this.request.user as User;
    dto.userUploadId = user.id;
    return this.fileService.updateFile(user.id, dto);
  }
}
