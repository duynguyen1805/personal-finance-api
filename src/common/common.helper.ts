import * as fs from 'fs';
import * as getStream from 'get-stream';
import { parse } from 'csv-parse';
import { isEmpty, random, zipObject } from 'lodash';
import { utils } from 'ethers';

export const removeEmptyAttr = (obj: any): any => {
  return Object.entries(obj)
    .filter(([_, v]) => v != null)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
};

export const readCSVData = async (filePath): Promise<any> => {
  const parseStream = parse({ delimiter: ',' });
  const data = await getStream.array(
    fs.createReadStream(filePath).pipe(parseStream)
  );

  const transData = [];
  if (!isEmpty(data)) {
    const keys = data.shift();
    data.map((x) => {
      transData.push(zipObject(keys as any, x as any));
    });
  }

  return transData;
};

export const endOfYear = (date: Date, dis = 0) => {
  return new Date(date.getFullYear() + dis + 1, 0, 0, 0, 0, -1);
};

export const beginOfYear = (date: Date, dis = 0) => {
  return new Date(date.getFullYear(), date.getMonth() + dis, 0);
};

export const endOfMonth = (date: Date, dis = 0) => {
  return new Date(date.getFullYear(), date.getMonth() + dis + 1, 0, 0, 0, -1);
};

export const beginOfMonth = (date: Date, dis = 0) => {
  return new Date(date.getFullYear(), date.getMonth() + dis, 0);
};

export const beginOfDate = (date: Date, dis = 0) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dis);
};

export const endOfDate = (date: Date, dis = 0) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + dis,
    23,
    59,
    59
  );
};

export const getDifferenceInDays = (date1, date2) => {
  const differenceInTime = date2.getTime() - date1.getTime() + 1000;
  return differenceInTime / (1000 * 3600 * 24);
};

export const isDateEqual = (date1: Date, date2: Date) => {
  return date1.getTime() === date2.getTime();
};

export const formatParams = (query) => {
  const splits = query.split(' -- PARAMETERS: ');
  const params = [...JSON.parse(splits[1])];
  return [splits[0], params] as const;
};

export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return parseFloat(data);
  }
}

export const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

export const parseUnits = (amount: number) => {
  return utils.parseUnits(amount.toFixed(6), 'ether').toString();
};

export const generateRandomCodeNumber = (length: number) => {
  if (isNaN(length) || length <= 0 || length > 10)
    throw new Error('INVALID_LENGTH');
  const min = 1111111111 % 10 ** length;
  return random(min, min * 9).toString();
};
