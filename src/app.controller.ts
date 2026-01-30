import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { FileService } from './common/service/File.service';
import { Response } from 'express';
import { Readable } from 'stream';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly fileService: FileService,
  ) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
  /**
   * Get file upload
   */
  @Get('image/:path')
  async getFile(
    @Param('path') path: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { Body, ContentType, ContentLength } =
        await this.fileService.getFile('image/' + path);
      const stream = Body as Readable;
      res.setHeader('Content-Type', ContentType);
      res.setHeader('Content-Length', ContentLength);

      stream.pipe(res);
      stream.on('error', (err) => {
        console.error('Error streaming data:', err);
        res.status(500).send('Error streaming file');
      });
    } catch (error) {
      console.error('Failed to get file:', error);
      res.status(500).send('Failed to get file');
    }
  }
}
