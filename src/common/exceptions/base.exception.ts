import { HttpException } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(message: string, status: number) {
    super({
      statusCode: status,
      message,
      error: message,
      timestamp: new Date().toISOString(),
    }, status);
  }
}
