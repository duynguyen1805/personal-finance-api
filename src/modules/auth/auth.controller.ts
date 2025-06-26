import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiKeyGuard } from './guards/api-key.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiBody({ type: LoginAuthDto })
  login(@Request() req) {
    return this.authService.login(req.body);
  }

  @Post('/admin/login')
  @ApiBody({ type: LoginAuthDto })
  @UseGuards(ApiKeyGuard)
  adminLogin(@Request() req) {
    return this.authService.login(req.body, true);
  }
}
