import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { EnumAffDirect } from './enum.dto';
import { Transform } from 'class-transformer';

export class CreateAffiliateDto {
  @ApiProperty()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ type: 'number' })
  @IsOptional()
  @Transform((raw) => +raw.value)
  income?: number;

  @ApiPropertyOptional()
  avatar: string;

  @ApiProperty()
  @IsNotEmpty()
  refAddress: string;

  @ApiProperty({
    type: 'enum',
    enum: EnumAffDirect,
    example: EnumAffDirect.LEFT
  })
  @IsNotEmpty()
  direction: EnumAffDirect;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform((raw) => +raw.value)
  packageAmount?: number;

  @ApiPropertyOptional()
  hash?: string;
}
