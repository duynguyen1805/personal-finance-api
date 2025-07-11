import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean
} from 'class-validator';
import {
  RecurringType,
  RecurringFrequency
} from '../entities/recurring-transaction.entity';

export class CreateRecurringTransactionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  categoryId?: number;

  @IsEnum(RecurringType)
  recurringType: RecurringType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(RecurringFrequency)
  frequency: RecurringFrequency;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  lastExecuted?: string;
}
