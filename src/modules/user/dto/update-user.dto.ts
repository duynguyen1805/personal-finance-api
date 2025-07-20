import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  lastName: string;

  @ApiProperty()
  @IsOptional()
  firstName: string;

  @ApiProperty()
  @IsOptional()
  avatar: number;

  @ApiProperty()
  @IsOptional()
  isTwoFactorAuthEnabled?: boolean;

  @ApiProperty()
  @IsOptional()
  twoFactorAuthSecret?: string;

  @ApiProperty()
  @IsOptional()
  timeActiveTwoFactorAuth?: Date;

  @ApiProperty()
  @IsOptional()
  theme?: string;

  @ApiProperty()
  @IsOptional()
  currency?: string;
}
