import { Module } from '@nestjs/common';
import { UploadFirebaseController } from './upload-firebase.controller';
import { UploadFirebaseService } from './upload-firebase.service';
import {
  SingleUploadInterceptor,
  MultiUploadInterceptor
} from '../../common/interceptors/upload.interceptor';

@Module({
  imports: [],
  controllers: [UploadFirebaseController],
  providers: [
    UploadFirebaseService,
    SingleUploadInterceptor,
    MultiUploadInterceptor
  ],
  exports: [UploadFirebaseService]
})
export class UploadModule {}
