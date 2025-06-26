/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@nestjs/common';
import { create } from 'ipfs-http-client';

const uploadBaseUrl = process.env.UPLOAD_SERVER_BASE_URL;
const getFileBaseUrl = process.env.GET_UPLOAD_FILE_BASE_URL;

@Injectable()
export class UploadService {
  private _ipfsClient: any;

  constructor() {}

  async getNode(): Promise<any> {
    return this._ipfsClient
      ? this._ipfsClient
      : (this._ipfsClient = await create({
          url: uploadBaseUrl
        }));
  }

  async singleUpload(file: any) {
    if (file) {
      await this.getNode();
      const res = await this._ipfsClient.add(Buffer.from(file.buffer));
      return `${getFileBaseUrl}/ipfs/${res.cid}`;
    }
    return null;
  }

  multiUpload(files: any) {
    if (files) {
      return this.getNode().then(async () => {
        const links = [];
        for (let i = 0; i < files.length; i++) {
          links.push(
            await this._ipfsClient
              .add(Buffer.from(files[i].buffer))
              .then((res) => {
                return `${getFileBaseUrl}/ipfs/${res.cid}`;
              })
          );
        }

        return links;
      });
    }
  }

  async multiUploadSync(files: any) {
    if (files) {
      await this.getNode();

      return Promise.all(
        files.map((file) => {
          return this.singleUpload(file);
        })
      );

      // const buffers = files.map((file) => Buffer.from(file.buffer));
      // try {
      //   for await (const res of this._ipfsClient.addAll(buffers, {
      //     pin: true,
      //     wrapWithDirectory: true,
      //     timeout: 10000
      //   })) {
      //     links.push(`${getFileBaseUrl}/ipfs/${res.cid}`);
      //   }
      // } catch (e) {
      //   console.log(e);
      // }
    }
    return null;
  }
}
