import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../../modules/user/user.module';
import { UserService } from '../../modules/user/user.service';
import { UpdateUserUseCase } from '../../modules/user/use-cases/update-user.use-case';
import { User } from '../../modules/user/entities/user.entity';
import { FetchUserDto } from '../../modules/user/dto/fetch-user.dto';
import { UpdateUserDto } from '../../modules/user/dto/update-user.dto';
import { Mailer } from './mailer-v2';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([User])],
  providers: [UserService, UpdateUserUseCase],
  exports: [UserService]
})
export class EmailModule {
  constructor(private readonly userService: UserService) {
    // initialize Mailer with UserService
    Mailer.initialize(this.userService);
  }
} 