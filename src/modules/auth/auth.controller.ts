import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth-wallet.dto';
import { ApiKeyGuard } from './guards/api-key.guard';
import { LoginAuthAccountDto } from './dto/login-auth-account.dto';

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

  @Post('/login-account')
  @ApiBody({ type: LoginAuthAccountDto })
  loginAccount(@Request() req) {
    return this.authService.login(req.body);
  }
}
