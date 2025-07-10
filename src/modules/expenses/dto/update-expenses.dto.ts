import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateExpensesDto } from './create-expenses.dto';
import { IsNotEmpty } from 'class-validator';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateExpensesDto extends PartialType(CreateExpensesDto) {
  @ApiProperty()
  @IsNotEmpty()
  expenseId: number;
}
