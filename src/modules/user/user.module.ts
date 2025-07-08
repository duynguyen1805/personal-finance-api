import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from '../role/role.module';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RoleModule],
  controllers: [UserController],
  providers: [UserService, UpdateUserUseCase],
  exports: [UserService]
})
export class UserModule {}
