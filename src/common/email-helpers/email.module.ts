import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../../modules/user/user.module';
import { UserService } from '../../modules/user/user.service';
import { UpdateUserUseCase } from '../../modules/user/use-cases/update-user.use-case';
import { User } from '../../modules/user/entities/user.entity';
import { FetchUserDto } from '../../modules/user/dto/fetch-user.dto';
import { UpdateUserDto } from '../../modules/user/dto/update-user.dto';
import { Mailer } from './mailer-v2';
import { Notifications } from '../../modules/notifications/entities/notification.entity';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { UserNotificationPreferences } from '../../modules/user/entities/user-notification-preferences.entity';
import { UserAuthProvider } from '../../modules/user/entities/user-auth-provider.entity';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      User,
      Notifications,
      UserNotificationPreferences,
      UserAuthProvider
    ]),
    NotificationsModule
  ],
  providers: [UserService, UpdateUserUseCase],
  exports: [UserService]
})
export class EmailModule {
  constructor(private readonly userService: UserService) {
    // initialize Mailer with UserService
    Mailer.initialize(this.userService);
  }
}
