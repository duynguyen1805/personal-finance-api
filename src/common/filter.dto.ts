import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';

export class FilterDto {
  @ApiPropertyOptional({ default: 10 })
  @Transform((raw) => +raw.value)
  limit: number;

  @ApiPropertyOptional({ default: 1 })
  @Transform((raw) => +raw.value)
  page: number;

  @ApiPropertyOptional({ default: false })
  @Transform(({ value }) => {
    return value === 'true' || value === true || value === 1;
  })
  isGetAll: boolean;

  @ApiPropertyOptional()
  keyword: string;

  @ApiPropertyOptional({
    isArray: true
  })
  @Transform(({ value }) => {
    return value
      ? value.includes('[') && value.includes(']')
        ? JSON.parse(value)
        : [value]
      : [];
  })
  @IsArray()
  @IsOptional()
  searchBy: string[];

  @ApiPropertyOptional({ default: 'createdAt' })
  sortBy: string;

  @ApiPropertyOptional({ enum: ['DESC', 'ASC'], default: 'ASC' })
  sortOrder: 'DESC' | 'ASC';
}
