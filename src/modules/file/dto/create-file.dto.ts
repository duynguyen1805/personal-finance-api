import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class CreateFileDto {
  @ApiProperty()
  @IsOptional()
  userUploadId: number;

  @ApiProperty()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty()
  @IsNotEmpty()
  fileExtension: string;

  @ApiProperty()
  @IsNotEmpty()
  url: string;

  @ApiProperty()
  @IsNotEmpty()
  mineType: string;

  @ApiProperty()
  @IsNotEmpty()
  size: number;

  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsOptional()
  uploadHash: string;

  @ApiProperty()
  @IsOptional()
  priorityStorage: string;
}
