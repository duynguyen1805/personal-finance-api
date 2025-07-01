import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth-wallet.dto';
import { ApiKeyGuard } from './guards/api-key.guard';
import { LoginAuthAccountDto } from './dto/login-auth-account.dto';
import { SignUpAuthAccountDto } from './dto/signup-auth-account.dto';
import { VerifyRegistrationAccountDto } from './dto/verify-registration.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login-wallet')
  @ApiBody({ type: LoginAuthDto })
  login(@Request() req) {
    return this.authService.login(req.body);
  }

  @Post('/admin/login-wallet')
  @ApiBody({ type: LoginAuthDto })
  @UseGuards(ApiKeyGuard)
  adminLogin(@Request() req) {
    return this.authService.login(req.body, true);
  }

  @Post('/signup-account')
  @ApiBody({ type: SignUpAuthAccountDto })
  signupAccount(@Request() req) {
    return this.authService.signUp(req.body);
  }

  @Post('/login-account')
  @ApiBody({ type: LoginAuthAccountDto })
  loginAccount(@Request() req) {
    return this.authService.login(req.body);
  }

  @Post('/verify-registration')
  @ApiBody({ type: VerifyRegistrationAccountDto })
  verifyRegistration(@Request() req) {
    return this.authService.verifyRegistration(req.body);
  }
}
