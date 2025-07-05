import multer from 'multer';
import { RequestHandler } from 'express';
import { Settings } from '../../settings';

const multerOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: Settings.UPLOADING_FILE_SIZE }
};

const fieldsConfig = [{ name: 'file', maxCount: 1 }];

export const uploadMiddleware = multer(multerOptions).fields(
  fieldsConfig
) as RequestHandler;
