// src/common/helpers/assertions.ts
import { ServerError } from '../../common/exceptions/server-error.exception.filter';

export function mustAuthenticateTwoFa(
  expression: boolean,
  message = 'TWO_FA_INCORRECT',
  messageText?: string,
  statusCode = 400
) {
  if (expression) return;
  throw new ServerError(message, statusCode, messageText);
}

export function mustTwoFa(
  expression: boolean,
  message = 'REQUIRED_TWO_FA',
  messageText?: string,
  statusCode = 400
) {
  if (!expression) return;
  throw new ServerError(message, statusCode, messageText);
}

export function makeSure(
  expression: boolean,
  message = 'INVALID_MAKE_SURE',
  messageText?: string,
  statusCode = 400
) {
  if (expression) return;
  throw new ServerError(message, statusCode, messageText);
}

export function mustExist(
  value: unknown,
  message = 'NOT_EXIST',
  messageText?: string,
  statusCode = 400
) {
  if (value) return;
  throw new ServerError(message, statusCode, messageText);
}

export function mustMatchReg(
  value: string,
  reg: RegExp,
  message = 'NOT_MATCH_REGEX',
  messageText?: string,
  statusCode = 400
) {
  if (typeof value === 'string' && value.match(reg)) return;
  throw new ServerError(message, statusCode, messageText);
}
