import { Module } from '@nestjs/common';

import { Blog } from './entities/Blog.entity';
import { ContactUs } from './entities/ContactUs.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { BlogController } from './controller/Blog.controller';
import { ContactUsController } from './controller/ContactUs.controller';
import { BlogService } from './service/Blog.service';
import { ContactUsService } from './service/ContactUs.service';
@Module({
  providers: [BlogService, ContactUsService],
  controllers: [BlogController, ContactUsController],
  imports: [CommonModule, TypeOrmModule.forFeature([Blog, ContactUs])],
})
export class CommunicationModule {}
