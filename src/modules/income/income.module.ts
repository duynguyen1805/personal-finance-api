import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Income } from './entities/income.entity';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Income, User])],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService]
})
export class IncomeModule {}
