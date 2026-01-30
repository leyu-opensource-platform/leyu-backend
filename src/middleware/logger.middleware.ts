// src/common/middleware/logger.middleware.ts
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Listen for response finish event
    res.on('finish', () => {
      const { method, originalUrl, httpVersion } = req;
      const { statusCode } = res;
      const userAgent = req.get('user-agent') || '-';
      const contentLength = res.get('content-length') || '0';
      const ip = req.ip || req.connection.remoteAddress;

      const now = new Date();
      const dateTime = now.toISOString().replace('T', ' ').substring(0, 19);
      const dayMonthYear = now
        .toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/ /g, '/');

      if (statusCode >= 500) {
        Logger.error(
          `${dateTime}: ${ip} - - [${dayMonthYear}:${now.toTimeString().split(' ')[0]} +0000] "${method} ${originalUrl} HTTP/${httpVersion}" ${statusCode} ${contentLength} "-" "${userAgent}"`,
        );
      } else if (statusCode >= 400) {
        Logger.warn(
          `${dateTime}: ${ip} - - [${dayMonthYear}:${now.toTimeString().split(' ')[0]} +0000] "${method} ${originalUrl} HTTP/${httpVersion}" ${statusCode} ${contentLength} "-" "${userAgent}"`,
        );
      } else {
        console.log(
          `${dateTime}: ${ip} - - [${dayMonthYear}:${now.toTimeString().split(' ')[0]} +0000] "${method} ${originalUrl} HTTP/${httpVersion}" ${statusCode} ${contentLength} "-" "${userAgent}"`,
        );
      }
    });

    next();
  }
}
