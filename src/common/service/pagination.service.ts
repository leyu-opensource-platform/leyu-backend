import { ObjectLiteral, Repository } from 'typeorm';
import { PaginationDto } from '../dto/Pagination.dto';
import { paginate, PaginatedResult } from 'src/utils/paginate.util';
import { QueryOptions } from 'src/utils/queryOption.util';
import { FindOptionsRelations } from 'typeorm';

export class PaginationService<T> {
  constructor(
    private readonly repository: Repository<T extends ObjectLiteral ? T : any>,
  ) {}

  async paginate(
    paginationDto: PaginationDto,
    queryBuilderAlias: string,
    query?: any,
    order?: { [key: string]: 'ASC' | 'DESC' } | string[],
  ): Promise<PaginatedResult<T>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    // create a descending order if not provided by date
    if (!order) {
      order = { created_date: 'DESC' };
    } else if (Array.isArray(order)) {
      order = order.reduce(
        (acc, curr) => {
          const [key, value] = Object.entries(curr)[0];
          acc[key] = value as 'ASC' | 'DESC';
          return acc;
        },
        {} as { [key: string]: 'ASC' | 'DESC' },
      );
    }

    const [data, total] = await this.repository
      .createQueryBuilder(queryBuilderAlias)
      .where(query ? query : {})
      .orderBy(order)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return paginate(data, total, page, limit);
  }
  async paginateWithOptionQuery(
    paginationDto: PaginationDto,
    queryBuilderAlias: string,
    queryOption?: QueryOptions<T>,
  ): Promise<PaginatedResult<T>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;

    const queryBuilder = this.repository.createQueryBuilder(queryBuilderAlias);

    // Apply 'where' conditions
    if (queryOption?.where) {
      queryBuilder.where(queryOption.where);
    }

    // Apply 'orderBy' conditions
    // Apply 'order' (if it's an array)
    if (Array.isArray(queryOption?.order)) {
      queryOption.order.forEach((orderItem) => {
        const [column, direction] = Object.entries(orderItem)[0]; // Extract key-value pair
        queryBuilder.addOrderBy(
          `${queryBuilderAlias}.${column}`,
          direction as 'ASC' | 'DESC',
        );
      });
    }
    // Apply 'order' (if it's an object)
    else if (queryOption?.order && typeof queryOption.order === 'object') {
      Object.entries(queryOption.order).forEach(([column, direction]) => {
        queryBuilder.addOrderBy(
          `${queryBuilderAlias}.${column}`,
          direction as 'ASC' | 'DESC',
        );
      });
    }
    // Apply order if it's is not provided
    if (!queryOption?.order) {
      console.log('No order provided, defaulting to created_date DESC');
      queryBuilder.addOrderBy(`${queryBuilderAlias}.created_date`, 'DESC');
    }
    // Apply 'select' fields
    if (queryOption?.select) {
      queryBuilder.select(
        Object.keys(queryOption.select)
          .filter((key) => queryOption.select?.[key]) // Ensure selected fields are true
          .map((key) => `${queryBuilderAlias}.${key}`), // Prefix with alias
      );
    }

    // Apply 'relations'
    // Apply 'relations' (handling array of strings)
    if (queryOption?.relations) {
      const applyRelations = (
        relations: FindOptionsRelations<T> | string[],
        parentAlias: string = queryBuilderAlias,
      ) => {
        if (Array.isArray(relations)) {
          relations.forEach((relation) => {
            queryBuilder.leftJoinAndSelect(
              `${parentAlias}.${relation}`,
              relation,
            );
          });
        } else {
          Object.entries(relations).forEach(([relation, nested]) => {
            const relationAlias = `${parentAlias}_${relation}`; // unique alias
            queryBuilder.leftJoinAndSelect(
              `${parentAlias}.${relation}`,
              relationAlias,
            );
            if (typeof nested === 'object') {
              applyRelations(nested as any, relationAlias); // recursively apply nested relations
            }
          });
        }
      };

      applyRelations(queryOption.relations);
    }

    // Apply pagination
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return paginate(data, total, page, limit);
  }
  // async paginateWithQueryBuilder(
  //   qb: SelectQueryBuilder<T>,
  //   paginationDto: PaginationDto,
  // ): Promise<PaginatedResult<T>> {
  //   const page = paginationDto.page || 1;
  //   const limit = paginationDto.limit || 10;

  //   const [data, total] = await qb
  //     .skip((page - 1) * limit)
  //     .take(limit)
  //     .getManyAndCount();

  //   return paginate(data, total, page, limit);
  // }
}
