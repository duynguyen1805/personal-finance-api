// import { getEnv } from '.';
import * as Minio from 'minio';
import { IFileUploadInput } from '../../modules/file/interface/file.interface';
import { v4 as uuidv4 } from 'uuid';
import { Readable, pipeline } from 'stream';
const fs = require('fs');
import { promisify } from 'util';
import { configService } from '../../config/config.service';

const pipelineAsync = promisify(pipeline);

// MinIO configs
// const {
//   STORAGE_LOCAL_ENDPOINT,
//   MINIO_UPLOAD_LOCAL_PORT,
//   USE_SSL,
//   STORAGE_ENDPOINT,
//   MINIO_UPLOAD_PORT,
//   MINIO_UPLOAD_ACCESS_KEY,
//   MINIO_UPLOAD_SECRET_KEY,
//   MINIO_UPLOAD_BUCKET_NAME
// } = getEnv();

const configMinIO = configService.getMinIOConfig();

// Init minio client
const minioClient = new Minio.Client({
  endPoint: configMinIO.STORAGE_LOCAL_ENDPOINT,
  port: +configMinIO.MINIO_UPLOAD_LOCAL_PORT,
  useSSL: configMinIO.USE_SSL === 'true' ? true : false,
  accessKey: configMinIO.MINIO_UPLOAD_ACCESS_KEY,
  secretKey: configMinIO.MINIO_UPLOAD_SECRET_KEY
});

const bucketName = configMinIO.MINIO_UPLOAD_BUCKET_NAME;

export async function uploadFileToMinIO(
  file: IFileUploadInput
): Promise<string> {
  const fileName = `${file.originalname}`;
  const metaData = {
    'Content-Type': file.mimetype
  };
  await minioClient.putObject(
    bucketName,
    fileName,
    file.buffer,
    null,
    metaData
  );

  return `https://${configMinIO.STORAGE_ENDPOINT}/${
    bucketName ? bucketName + '/' : ''
  }${fileName}`;
}

/**
 * list các file trong bucket với prefix chỉ định. (ex: abc_)
 * @param {string} prefix - prefix để lọc file.
 * @returns {Promise<string[]>}
 */
export async function listFilesWithPrefix(prefix: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const fileNames: string[] = [];
    const stream = minioClient.listObjects(bucketName, prefix, true);

    stream.on('data', (obj) => {
      fileNames.push(obj.name);
    });
    stream.on('end', () => {
      resolve(fileNames);
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

export async function downloadFromMinIO(fileName: string): Promise<Readable> {
  try {
    // getObject với Promise và trả về stream
    const stream = await minioClient.getObject(bucketName, fileName);
    return stream;
  } catch (err) {
    throw new Error(`Error downloading file from MinIO: ${err}`);
  }
}

export async function deleteFromMinIO(fileName: string): Promise<void> {
  try {
    // xóa file khỏi MinIO
    await minioClient.removeObject(bucketName, fileName);
  } catch (err) {
    throw new Error(`Error deleting file from MinIO: ${err}`);
  }
}

export async function sortChunks(
  chunkFileNames: string[],
  chunkPrefix: string
): Promise<string[]> {
  return chunkFileNames.sort((a, b) => {
    const numA = parseInt(
      a.replace(chunkPrefix, '').replace(/[^0-9]/g, ''),
      10
    );
    const numB = parseInt(
      b.replace(chunkPrefix, '').replace(/[^0-9]/g, ''),
      10
    );
    return numA - numB;
  });
}
