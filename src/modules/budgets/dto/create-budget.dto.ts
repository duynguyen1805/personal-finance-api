import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class CreateBudgetDto {
  @ApiProperty()
  @IsOptional()
  budgetName: string;

  @ApiProperty()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty()
  @IsOptional()
  period: string;

  @ApiProperty()
  @IsOptional()
  spent: number;

  @ApiProperty()
  @IsNotEmpty()
  startDate: string | Date;

  @ApiProperty()
  @IsNotEmpty()
  endDate: string | Date;
}
