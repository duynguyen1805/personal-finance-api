import { Module } from '@nestjs/common';
import { UploadMinioController } from './upload-minio.controller';
import { UploadMinioService } from './upload-minio.service';
import {
  SingleUploadInterceptor,
  MultiUploadInterceptor
} from '../../common/interceptors/upload.interceptor';

@Module({
  imports: [],
  controllers: [UploadMinioController],
  providers: [
    UploadMinioService,
    SingleUploadInterceptor,
    MultiUploadInterceptor
  ],
  exports: [UploadMinioService]
})
export class UploadMinIOModule {}
