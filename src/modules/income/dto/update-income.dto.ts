import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateIncomeDto } from './create-income.dto';
import { IsNotEmpty } from 'class-validator';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateIncomeDto extends PartialType(CreateIncomeDto) {
  @ApiProperty()
  @IsNotEmpty()
  incomeId: number;
}
