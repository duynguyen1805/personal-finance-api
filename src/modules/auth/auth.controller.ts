import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth-wallet.dto';
import { ApiKeyGuard } from './guards/api-key.guard';
import { LoginAuthAccountDto } from './dto/login-auth-account.dto';
import { SignUpAuthAccountDto } from './dto/signup-auth-account.dto';
import { VerifyRegistrationAccountDto } from './dto/verify-registration.dto';
import { ResendVerifyRegistrationAccountDto } from './dto/resend-verify-registration.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../user/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(REQUEST) private request: Request
  ) {}

  // @Post('/login-wallet')
  // @ApiBody({ type: LoginAuthDto })
  // login(@Request() req) {
  //   return this.authService.signIn(req.body);
  // }

  // @Post('/admin/login-wallet')
  // @ApiBody({ type: LoginAuthDto })
  // @UseGuards(ApiKeyGuard)
  // adminLogin(@Request() req) {
  //   return this.authService.signIn(req.body, true);
  // }

  @Post('/signup-account')
  @ApiBody({ type: SignUpAuthAccountDto })
  signupAccount(@Body() dto: SignUpAuthAccountDto) {
    return this.authService.signUp(dto);
  }

  @Post('/login-account')
  @ApiBody({ type: LoginAuthAccountDto })
  loginAccount(@Body() dto: LoginAuthAccountDto) {
    return this.authService.signIn(dto);
  }

  @Post('/verify-registration')
  @ApiBody({ type: VerifyRegistrationAccountDto })
  verifyRegistration(@Body() dto: VerifyRegistrationAccountDto) {
    return this.authService.verifyRegistration(dto);
  }

  @Post('/resend-verify-registration')
  @ApiBody({ type: ResendVerifyRegistrationAccountDto })
  resendVerifyRegistration(@Body() dto: ResendVerifyRegistrationAccountDto) {
    const user = this.request.user as User;
    return this.authService.resendVerifyRegistration(dto, user.id);
  }
}
