import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
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
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  resendVerifyRegistration(@Body() dto: ResendVerifyRegistrationAccountDto) {
    const user = this.request.user as User;
    return this.authService.resendVerifyRegistration(dto, user.id);
  }

  @Get('/2fa/generate')
  @UseGuards(JwtAuthGuard)
  async generate2FA() {
    const user = this.request.user as User;
    return this.authService.generate2FASecret(user.id, user.email);
  }

  @Post('/2fa/verify')
  @UseGuards(JwtAuthGuard)
  async verify2FA(@Body('code') code: string) {
    const user = this.request.user as User;
    return this.authService.verify2FA(user.id, code);
  }

  @Post('/2fa/enable')
  @UseGuards(JwtAuthGuard)
  async enable2FA(@Body('code') code: string) {
    const user = this.request.user as User;
    return this.authService.enable2FA(user.id, code);
  }

  @Post('/2fa/disable')
  @UseGuards(JwtAuthGuard)
  async disable2FA(
    @Body('code') code: string,
    @Body('emailOtp') emailOtp?: string
  ) {
    const user = this.request.user as User;
    return this.authService.disable2FA(user.id, code, emailOtp);
  }

  @Post('/2fa/status')
  @UseGuards(JwtAuthGuard)
  async get2FAStatus() {
    const user = this.request.user as User;
    return this.authService.get2FAStatus(user.id);
  }

  @Post('/2fa/send-disable-otp')
  @UseGuards(JwtAuthGuard)
  async sendDisable2FAOtp() {
    const user = this.request.user as User;
    return this.authService.sendDisable2FAOtp(user.id, user.email);
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    const authHeader = this.request.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');
    return this.authService.logOut(token);
  }
}
