import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { mustExist } from '../../../common/helpers/server-error.helper';
import { Income } from '../entities/income.entity';
import { EErrorIncome, EErrorDetail } from '../interface/enum.interface';
import { UpdateIncomeDto } from '../dto/update-income.dto';

@Injectable()
export class UpdateIncomeUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>
  ) {}

  async execute(userId: number, dto: UpdateIncomeDto) {
    await this.validateUser(userId);
    return await this.incomeRepository.update(userId, {
      ...dto,
      userId: userId
    });
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({ id: userId });
    mustExist(
      user,
      EErrorIncome.CANNOT_FIND_USER,
      EErrorDetail.CANNOT_FIND_USER
    );
  }
}
