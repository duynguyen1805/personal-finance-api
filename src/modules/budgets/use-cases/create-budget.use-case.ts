// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from '../../user/entities/user.entity';
// import { mustExist } from '../../../common/helpers/server-error.helper';
// import { Budgets } from '../entities/budgets.entity';
// import { EErrorIncome, EErrorDetail } from '../interface/enum.interface';
// import { CreateBudgetDto } from '../dto/create-budget.dto';

// @Injectable()
// export class CreateBudgetUseCase {
//   constructor(
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//     @InjectRepository(Budgets)
//     private budgetRepository: Repository<Budgets>
//   ) {}

//   async execute(userId: number, dto: CreateBudgetDto) {
//     await this.validateUser(userId);
//     return await this.budgetRepository.save({
//       ...dto,
//       userId: userId
//     });
//   }

//   async validateUser(userId: number) {
//     const user = await this.userRepository.findOne({ id: userId });
//     mustExist(
//       user,
//       EErrorIncome.CANNOT_FIND_USER,
//       EErrorDetail.CANNOT_FIND_USER
//     );
//   }
// }
