import {ArgumentsHost,Catch,ExceptionFilter,HttpException,HttpStatus,} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let type = 'INTERNAL_ERROR';
    let code: string | number | undefined = undefined;

    // Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      type = 'PRISMA_ERROR';
      code = exception.code;

      if (exception.code === 'P2002') {
        status = HttpStatus.BAD_REQUEST;

        const target = Array.isArray(exception.meta?.target)
          ? exception.meta.target.join(', ')
          : exception.meta?.target ?? 'unknown_field';

        message = `failed on ${target}`;
      }

      else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      }

      else {
        message = exception.message;
      }
    }

    // HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      type = 'HTTP_ERROR';

      const responseMessage = exception.getResponse();

      if (typeof responseMessage === 'string') {
        message = responseMessage;
      } else if (typeof responseMessage === 'object') {
        message = (responseMessage as any).message || message;
      }
    }

    // Runtime JS Errors
    else if (exception instanceof Error) {
      type = 'RUNTIME_ERROR';
      message = exception.message;
    }

    // Return JSON
    response.status(status).json({
      success: false,
      type,
      message,
      status,
      code,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
