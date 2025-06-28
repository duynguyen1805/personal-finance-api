import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: '0x410804dda338F103B6A14FAc8176263Ca092548C' })
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  deadline: number;

  @ApiProperty()
  @IsNotEmpty()
  sig: string;
}
