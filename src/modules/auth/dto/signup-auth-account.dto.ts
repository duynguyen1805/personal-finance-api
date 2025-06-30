import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class SignUpAuthAccountDto {
  @ApiProperty({ example: 'abc@gmail.com', required: true })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  lastName: string;
}
