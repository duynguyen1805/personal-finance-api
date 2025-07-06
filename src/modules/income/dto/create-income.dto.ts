import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class CreateIncomeDto {
  @ApiProperty()
  @IsNotEmpty()
  sourceName: string;

  @ApiProperty()
  @IsNotEmpty()
  month: string | Date;

  @ApiProperty()
  @IsNotEmpty()
  amount: number;
}
