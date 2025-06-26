import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RollbackSubTreeDto {
  @ApiProperty()
  @IsNotEmpty()
  oldAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  newAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  fromTime: Date | string;

  @ApiProperty()
  @IsNotEmpty()
  toTime: Date| string;
}
