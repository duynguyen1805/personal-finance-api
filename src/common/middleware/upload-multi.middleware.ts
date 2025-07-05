import multer from 'multer';
import { RequestHandler } from 'express';
import { Settings } from '../../settings';

const multerOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: Settings.UPLOADING_FILE_SIZE }
};

const fieldsConfig = [{ name: 'files', maxCount: 100 }];

export const multiUploadMiddleware = multer(multerOptions).fields(
  fieldsConfig
) as RequestHandler;
