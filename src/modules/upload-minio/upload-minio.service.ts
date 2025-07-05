/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@nestjs/common';
import { uploadFileToMinIO } from '../../common/helpers/minio-storage.helper';

@Injectable()
export class UploadMinioService {
  constructor() {}

  async singleUploadMinio(file: any): Promise<any> {
    const fileUrl = await this.uploadFilesToMinio(file);
    return fileUrl.file;
  }

  async multiUploadMinio(files: any): Promise<any> {
    const filesUrl = await this.uploadMultiFilesToMinio(files);
    return filesUrl;
  }

  private async uploadFilesToMinio(file: any): Promise<any> {
    const [fileUploaded] = await Promise.all([uploadFileToMinIO(file)]);
    return { fileUploaded };
  }

  private async uploadMultiFilesToMinio(files: any): Promise<any> {
    const filesUploaded = await Promise.all(
      files.map(async (file: any) => await uploadFileToMinIO(file))
    );
    return filesUploaded;
  }
}
