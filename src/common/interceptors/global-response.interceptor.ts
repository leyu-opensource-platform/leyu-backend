// src/common/interceptors/global-response.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class GlobalResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // If already formatted, return as is
        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          'code' in data
        ) {
          return data;
        }

        return {
          message: 'Success',
          code: res.statusCode || 200,
          data,
        };
      }),
    );
  }
}
