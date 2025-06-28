import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginAuthAccountDto {
  @ApiProperty({ example: 'abc@gmail.com' })
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false }) // <-- khai báo là không bắt buộc
  @IsOptional() // <-- validator cho optional
  @IsBoolean() 
  isRememberMe?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  recaptcha?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  twoFaCode?: string;
}
