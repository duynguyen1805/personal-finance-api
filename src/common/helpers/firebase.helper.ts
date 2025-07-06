import { HttpException, HttpStatus } from '@nestjs/common';
import { storage } from '../../config/firebase.config';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes
} from 'firebase/storage';

export const uploadFileImageToFirebaseReturnURL = async (files: any) => {
  //   let files = e.target.files;
  let fileArray = Array.from(files);

  let objectURLArray: any = [];
  let downloadURLArray: any = [];

  for (let i = 0; i < fileArray.length; i++) {
    let file: any = fileArray[i];
    if (!file.type.startsWith('image-presional-finance/')) {
      throw new HttpException(
        `File ${file.name} not is image.`,
        HttpStatus.BAD_REQUEST
      );
    }
    let objectURL = URL.createObjectURL(file);

    objectURLArray.push(objectURL);

    // upload img lên Firebase Storage
    const filename = Date.now().toString();
    const storageRef = ref(storage, `images_presional_finance/${filename}.png`);
    const snapshot = await uploadBytes(storageRef, file);

    // URL từ Firebase Storage
    const imageUrl = await getDownloadURL(snapshot.ref);

    downloadURLArray.push(imageUrl);
  }

  return downloadURLArray;
};
