import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class MoveSubTreeDto {
  @ApiProperty()
  @IsNotEmpty()
  oldAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  newParentAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  includeSelf: boolean;
}

export class getDescendantsByDepthDto {
  @ApiProperty()
  @IsNotEmpty()
  address: string;
  
  @ApiProperty()
  @IsNotEmpty()
  maxDepth: number;
}