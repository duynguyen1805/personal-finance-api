import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { EnumAffDirect } from './enum.dto';

export class GetAffParentDto {
  @ApiProperty()
  @IsNotEmpty()
  refAddress: string;

  @ApiProperty({ type: 'enum', enum: EnumAffDirect })
  @IsNotEmpty()
  direction: EnumAffDirect;
}
