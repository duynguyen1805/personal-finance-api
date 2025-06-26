import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Coin, FundOperation, TransactionType } from './enum.dto';

export class UpdateFundDto {
  @ApiProperty()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  operation: FundOperation;

  @ApiProperty()
  @IsNotEmpty()
  comment: string;

  @ApiProperty()
  @IsNotEmpty()
  uuid: string;

  @ApiProperty()
  @IsNotEmpty()
  coin: Coin;

  @ApiProperty()
  @IsNotEmpty()
  transactionType: TransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  transactionHash?: string;

  @ApiPropertyOptional()
  @IsOptional()
  rewardUserId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  rewardType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  walletAddress: string;
}
