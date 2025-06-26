import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpgradePackageDto {
  @ApiProperty()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform((raw) => +raw.value)
  packageAmount: number;

  @ApiPropertyOptional()
  hash: string;
}
