import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({
    description: 'Nhận thông báo qua email',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional({
    description: 'Nhận push notifications',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @ApiPropertyOptional({
    description: 'Cảnh báo khi vượt budget',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  budgetAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Nhắc nhở mục tiêu tài chính',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  goalReminders?: boolean;

  @ApiPropertyOptional({
    description: 'Thông báo khi có chi tiêu mới',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  expenseAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Thông báo khi có thu nhập mới',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  incomeAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Báo cáo tuần',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  weeklyReports?: boolean;

  @ApiPropertyOptional({
    description: 'Báo cáo tháng',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  monthlyReports?: boolean;

  @ApiPropertyOptional({
    description: 'Chúc mừng khi đạt thành tựu',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  achievementCelebrations?: boolean;

  @ApiPropertyOptional({
    description: 'Cập nhật hệ thống',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  systemUpdates?: boolean;
}

export class NotificationPreferencesResponseDto {
  @ApiProperty({
    description: 'ID của preferences',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'ID của user',
    example: 1
  })
  userId: number;

  @ApiProperty({
    description: 'Nhận thông báo qua email',
    example: true
  })
  email: boolean;

  @ApiProperty({
    description: 'Nhận push notifications',
    example: false
  })
  push: boolean;

  @ApiProperty({
    description: 'Cảnh báo khi vượt budget',
    example: true
  })
  budgetAlerts: boolean;

  @ApiProperty({
    description: 'Nhắc nhở mục tiêu tài chính',
    example: true
  })
  goalReminders: boolean;

  @ApiProperty({
    description: 'Thông báo khi có chi tiêu mới',
    example: true
  })
  expenseAlerts: boolean;

  @ApiProperty({
    description: 'Thông báo khi có thu nhập mới',
    example: true
  })
  incomeAlerts: boolean;

  @ApiProperty({
    description: 'Báo cáo tuần',
    example: true
  })
  weeklyReports: boolean;

  @ApiProperty({
    description: 'Báo cáo tháng',
    example: true
  })
  monthlyReports: boolean;

  @ApiProperty({
    description: 'Chúc mừng khi đạt thành tựu',
    example: true
  })
  achievementCelebrations: boolean;

  @ApiProperty({
    description: 'Cập nhật hệ thống',
    example: true
  })
  systemUpdates: boolean;

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