import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ECategoriesType } from '../enums/categories.enum';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class CreateCategoriesDto {
  @ApiProperty()
  @IsNotEmpty()
  categoryName: string;

  @ApiProperty()
  @IsNotEmpty()
  typeCategory: ECategoriesType;

  @ApiProperty()
  @IsOptional()
  categoryIcon: string;

  @ApiProperty()
  @IsOptional()
  categoryColor: string;
}
