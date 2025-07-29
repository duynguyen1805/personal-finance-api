import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from '../role/role.module';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Income } from '../income/entities/income.entity';
import { Expenses } from '../expenses/entities/expenses.entity';
import { Categories } from '../categories/entities/categories.entity';
import { Budgets } from '../budgets/entities/budgets.entity';
import { UserNotificationPreferences } from './entities/user-notification-preferences.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Income,
      Expenses,
      Categories,
      Budgets,
      UserNotificationPreferences
    ]),
    RoleModule
  ],
  controllers: [UserController, DashboardController],
  providers: [UserService, UpdateUserUseCase, DashboardService],
  exports: [UserService]
})
export class UserModule {}
