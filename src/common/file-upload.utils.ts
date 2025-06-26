import { diskStorage } from 'multer';
import { extname } from 'path';
const fs = require('fs');
const dayjs = require('dayjs');

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const splits = file.originalname.split('.');
  splits.pop();
  const name = splits.join('_');
  const folderName = dayjs().format('YYYYMMDD');

  const dir = `./files/${folderName}`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

  callback(null, `${folderName}/${name}-${randomName}${fileExtName}`);
};

export const multerOption = {
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  storage: diskStorage({
    destination: `./files`,
    filename: editFileName
  })
};
