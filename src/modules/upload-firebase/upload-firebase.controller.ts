import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards
} from '@nestjs/common';
import { UploadFirebaseService } from './upload-firebase.service';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import {
  SingleUploadInterceptor,
  MultiUploadInterceptor
} from '../../common/interceptors/upload.interceptor';

@ApiTags('upload-firebase')
@Controller('upload-firebase')
export class UploadFirebaseController {
  constructor(private readonly uploadService: UploadFirebaseService) {}

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
    return this.uploadService.singleUploadFirebase(file);
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
    return this.uploadService.multiUploadFirebase(files);
  }
}
