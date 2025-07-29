import { IsString, IsNumber, IsEnum, IsOptional, IsDate, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID của người dùng',
    example: 1
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Tiêu đề thông báo',
    example: 'Nhắc nhở mục tiêu tài chính'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Nội dung thông báo',
    example: 'Mục tiêu "Mua xe hơi" sắp đến hạn trong 7 ngày'
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Loại thông báo',
    enum: NotificationType,
    default: NotificationType.IN_APP
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    description: 'ID của entity liên quan',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  relatedEntityId?: number;

  @ApiPropertyOptional({
    description: 'Loại entity liên quan',
    example: 'financial_goal'
  })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @ApiPropertyOptional({
    description: 'Thời gian lên lịch gửi',
    example: '2024-12-31T00:00:00.000Z'
  })
  @IsOptional()
  @IsDate()
  scheduledAt?: Date;

  @ApiPropertyOptional({
    description: 'Metadata bổ sung',
    example: { goalName: 'Mua xe hơi', deadline: '2024-12-31' }
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
} 