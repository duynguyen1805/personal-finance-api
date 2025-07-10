import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ECategoriesType } from '../enums/categories.enum';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class CreateCategoriesDto {
  // @ApiProperty()
  // @IsNotEmpty()
  // budgetId: number;

  @ApiProperty()
  @IsNotEmpty()
  date: Date;

  @ApiProperty()
  @IsNotEmpty()
  categoryName: string;

  @ApiProperty()
  @IsNotEmpty()
  typeCategory: ECategoriesType;

  @ApiProperty()
  @IsOptional()
  allocatedAmount: number;
}
