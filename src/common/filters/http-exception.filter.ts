import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../interfaces/error-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: exceptionResponse.message || exception.message,
      error: exceptionResponse.error || exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 에러 로깅
    this.logger.error(
      `[${errorResponse.statusCode}] ${errorResponse.message}`,
      {
        path: errorResponse.path,
        timestamp: errorResponse.timestamp,
        stack: exception.stack,
      },
    );

    response.status(status).json(errorResponse);
  }
}
