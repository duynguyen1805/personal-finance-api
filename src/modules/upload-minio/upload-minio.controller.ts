import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards
} from '@nestjs/common';
import { UploadMinioService } from './upload-minio.service';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import {
  SingleUploadInterceptor,
  MultiUploadInterceptor
} from '../../common/interceptors/upload.interceptor';

@ApiTags('upload-minio')
@Controller('upload-minio')
export class UploadMinioController {
  constructor(private readonly uploadService: UploadMinioService) {}

  @Post('single')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @UseInterceptors(SingleUploadInterceptor)
  singleUpload(@UploadedFile() file) {
    return this.uploadService.singleUploadMinio(file);
  }

  @Post('multi')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    }
  })
  @UseInterceptors(MultiUploadInterceptor)
  multiUpload(@UploadedFiles() files) {
    return this.uploadService.multiUploadMinio(files);
  }
}
