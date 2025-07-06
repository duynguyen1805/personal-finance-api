/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@nestjs/common';
import { uploadFileImageToFirebaseReturnURL } from '../../common/helpers/firebase.helper';

@Injectable()
export class UploadFirebaseService {
  constructor() {}

  async singleUploadFirebase(file: any): Promise<any> {
    const fileUrl = await this.uploadFilesToFirebase(file);
    return fileUrl.file;
  }

  async multiUploadFirebase(files: any): Promise<any> {
    const filesUrl = await this.uploadMultiFilesToFirebase(files);
    return filesUrl;
  }

  private async uploadFilesToFirebase(file: any): Promise<any> {
    const [fileUploaded] = await Promise.all([
      uploadFileImageToFirebaseReturnURL(file)
    ]);
    return { fileUploaded };
  }

  private async uploadMultiFilesToFirebase(files: any): Promise<any> {
    const filesUploaded = await Promise.all(
      files.map(
        async (file: any) => await uploadFileImageToFirebaseReturnURL(file)
      )
    );
    return filesUploaded;
  }
}
