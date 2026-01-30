import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/Pagination.dto';

export class WithdrawMoneyDto {
  @ApiProperty({
    description: 'Payment Method',
    enum: ['Telebirr', 'CBE Birr'],
  })
  @IsEnum(['Telebirr', 'CBE Birr'])
  paymentMethod: 'Telebirr' | 'CBE Birr';

  @ApiProperty({ description: 'Phone Number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Amount to withdraw' })
  amount: number;
}
export class GetTransactionDto extends PaginationDto {
  @ApiProperty({
    description: 'Transaction type',
    enum: ['Credit', 'Withdraw'],
  })
  @IsEnum(['Credit', 'Withdraw'])
  type: 'Credit' | 'Withdraw';
}

export class ScoreValueDto {
  @ApiProperty({ description: 'Score Value' })
  @IsNumber()
  scoreValue: number;
}
