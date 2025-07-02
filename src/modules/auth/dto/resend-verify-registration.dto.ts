import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class ResendVerifyRegistrationAccountDto {
  @ApiProperty({ example: 'abc@gmail.com', required: true })
  @IsNotEmpty()
  email: string;
}
