import {
  FindOptionsWhere,
  FindOptionsSelect,
  FindOptionsRelations,
} from 'typeorm';
/**
 * Generic QueryOptions Type for TypeORM Queries
 */
export type QueryOptions<T> = {
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[]; // Filtering condition
  order?: { [P in keyof T]?: 'ASC' | 'DESC' }; // Sorting order
  select?: FindOptionsSelect<T>; // Selected fields
  relations?: FindOptionsRelations<T> | string[]; // Relations to include
};
