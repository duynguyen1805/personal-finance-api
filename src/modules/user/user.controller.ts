import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';
import { FetchUserDto } from './dto/fetch-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '../permission/permissison.guard';

@ApiTags('user')
@Controller('user')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Query() query: FetchUserDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
