import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCategoriesDto } from './create-categories.dto';
import { IsNotEmpty } from 'class-validator';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateCategoriesDto extends PartialType(CreateCategoriesDto) {
  @ApiProperty()
  @IsNotEmpty()
  categoryId: number;
}
