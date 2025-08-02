import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FirebaseLoginDto {
  @ApiProperty({
    description: 'Firebase ID token from client',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class FirebaseVerifyDto {
  @ApiProperty({
    description: 'Firebase ID token to verify',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
} 