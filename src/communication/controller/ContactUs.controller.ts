import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContactUsService } from '../service/ContactUs.service';
import { CreateContactUsDto, UpdateContactUsDto } from '../dto/ContactUs.dto';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('contact-us')
@ApiTags('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @ApiOperation({ summary: 'Create contact-us' })
  @UsePipes(new ZodValidationPipe(CreateContactUsDto))
  async create(@Body() body: CreateContactUsDto) {
    return await this.contactUsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contact-us' })
  @UsePipes(new ZodValidationPipe())
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.contactUsService.findManyPaginate({}, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact-us by id' })
  @UsePipes(new ZodValidationPipe())
  async findOne(@Param('id') id: string) {
    return await this.contactUsService.findOne({ id });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a contact-us by id' })
  @UsePipes(new ZodValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateContactUsDto: UpdateContactUsDto,
  ) {
    return await this.contactUsService.update(id, updateContactUsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact-us by id' })
  @UsePipes(new ZodValidationPipe())
  async remove(@Param('id') id: string) {
    return await this.contactUsService.remove(id);
  }
}
