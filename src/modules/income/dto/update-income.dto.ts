import { PartialType } from '@nestjs/swagger';
import { CreateIncomeDto } from './create-income.dto';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateIncomeDto extends PartialType(CreateIncomeDto) {}
