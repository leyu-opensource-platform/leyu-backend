import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResult<T> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty({ isArray: true })
  result: T[];
}

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    result: data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
