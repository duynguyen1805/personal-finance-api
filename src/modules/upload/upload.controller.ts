import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  singleUpload(@UploadedFile() file) {
    return this.uploadService.singleUpload(file);
  }

  @Post('multi')
  @UseInterceptors(FilesInterceptor('files', 10))
  multiUpload(@UploadedFiles() files) {
    return this.uploadService.multiUpload(files);
  }

  @Post('multi-sync')
  @UseInterceptors(FilesInterceptor('files', 10))
  multiUploadSync(@UploadedFiles() files) {
    return this.uploadService.multiUploadSync(files);
  }
}
