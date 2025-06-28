import { HttpException, HttpStatus } from '@nestjs/common';

export class ServerError extends HttpException {
  constructor(
    code: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    messageText?: string
  ) {
    super(
      {
        code,
        message: messageText || code
      },
      statusCode
    );
  }
}
