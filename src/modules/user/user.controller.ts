import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';
import { FetchUserDto } from './dto/fetch-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '../permission/permissison.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { User } from './entities/user.entity';
import { Permissions } from '../permission/permission.decorator';
import { UpdateNotificationPreferencesDto } from './dto/notification-preferences.dto';
import { NotificationPreferencesResponseDto } from './dto/notification-preferences.dto';

@ApiTags('user')
@Controller('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
// @UseGuards(PermissionGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Get()
  findAll(@Query() query: FetchUserDto) {
    console.log('this.request.user', this.request.user);
    return this.userService.findAll(query);
  }

  // Notification Preferences Endpoints - Must be before /:id to avoid route conflicts
  @Get('/notification-preferences')
  // @ApiTags('notification-preferences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getNotificationPreferences() {
    console.log('this.request.user', this.request.user);
    const user = this.request.user as User;
    return await this.userService.getNotificationPreferences(user.id);
  }

  @Post('/notification-preferences')
  // @ApiTags('notification-preferences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateNotificationPreferences(
    @Body() dto: UpdateNotificationPreferencesDto
  ) {
    const user = this.request.user as User;
    return await this.userService.updateNotificationPreferences(user.id, dto);
  }

  @Post('/notification-preferences/reset')
  // @ApiTags('notification-preferences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async resetNotificationPreferences() {
    const user = this.request.user as User;
    return await this.userService.resetNotificationPreferences(user.id);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('/update/profile')
  // @Permissions('EDIT_USER')
  updateUserInfo(@Body() dto: UpdateUserDto) {
    const user = this.request.user as User;
    return this.userService.updateUserInfo(user.id, dto);
  }
}
