import { ApiProperty } from '@nestjs/swagger';

export class FinancialGoalResponseDto {
  @ApiProperty({
    description: 'ID của mục tiêu tài chính',
    example: 1
  })
  goalId: number;

  @ApiProperty({
    description: 'ID của người dùng',
    example: 1
  })
  userId: number;

  @ApiProperty({
    description: 'Tên mục tiêu tài chính',
    example: 'Mua xe hơi'
  })
  goalName: string;

  @ApiProperty({
    description: 'Số tiền mục tiêu',
    example: 50000000
  })
  targetAmount: number;

  @ApiProperty({
    description: 'Ngày hạn chót',
    example: '2024-12-31T00:00:00.000Z'
  })
  deadline: Date;

  @ApiProperty({
    description: 'Tự động trừ tiền',
    example: true
  })
  autoDeduct: boolean;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
} 