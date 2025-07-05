import { Module } from '@nestjs/common';
import { UploadMinioController } from './upload-minio.controller';
import { UploadService } from './upload-minio.service';
import {
  SingleUploadInterceptor,
  MultiUploadInterceptor
} from '../../common/interceptors/upload.interceptor';

@Module({
  imports: [],
  controllers: [UploadMinioController],
  providers: [UploadService, SingleUploadInterceptor, MultiUploadInterceptor],
  exports: [UploadService]
})
export class UploadModule {}
