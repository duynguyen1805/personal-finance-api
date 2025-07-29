import { IsString, IsNumber, IsDate, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFinancialGoalDto {
  @ApiProperty({
    description: 'Tên mục tiêu tài chính',
    example: 'Mua xe hơi',
    maxLength: 255
  })
  @IsString()
  @MaxLength(255)
  goalName: string;

  @ApiProperty({
    description: 'Số tiền mục tiêu',
    example: 50000000,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  targetAmount: number;

  @ApiProperty({
    description: 'Ngày hạn chót để đạt mục tiêu',
    example: '2024-12-31'
  })
  @IsDate()
  deadline: Date;

  @ApiPropertyOptional({
    description: 'Tự động trừ tiền từ thu nhập',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  autoDeduct?: boolean;
} 