import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../entities/Blog.entity';
import { QueryRunner, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    private readonly paginationService: PaginationService<Blog>,
  ) {
    this.paginationService = new PaginationService(this.blogRepository);
  }

  async findAll(
    query: Partial<Blog>,
    queryRunner?: QueryRunner,
  ): Promise<Blog[]> {
    const manager = queryRunner ? queryRunner.manager : this.blogRepository;
    return await manager.find(Blog, { where: query });
  }

  async findOne(
    query: Partial<Blog>,
    queryRunner?: QueryRunner,
  ): Promise<Blog | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.findOne(Blog, { where: query });
    } else {
      const blog = await this.blogRepository.findOne({ where: query });
      return blog;
    }
  }
  async findManyPaginate(
    query: Partial<Blog>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Blog>> {
    return await this.paginationService.paginate(paginationDto, 'blog', query);
  }

  async create(blog: Partial<Blog>): Promise<Blog> {
    return await this.blogRepository.save(blog);
  }

  async update(id: string, updateBlogDto: Partial<Blog>): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException(`Blog #${id} not found`);
    }
    return await this.blogRepository.save({ ...blog, ...updateBlogDto });
  }

  async remove(id: string): Promise<void> {
    await this.blogRepository.delete(id);
  }
}
