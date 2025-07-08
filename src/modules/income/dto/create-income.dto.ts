import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { EIncomeTypeSourceName } from '../interface/enum.interface';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class CreateIncomeDto {
  @ApiProperty()
  @IsNotEmpty()
  sourceName: EIncomeTypeSourceName;

  @ApiProperty()
  @IsOptional()
  customName: string;

  @ApiProperty()
  @IsNotEmpty()
  date: Date;

  @ApiProperty()
  @IsNotEmpty()
  amount: number;
}
