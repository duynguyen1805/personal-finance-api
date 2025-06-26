import { PartialType } from '@nestjs/swagger';
import { FilterDto } from '../../../common/filter.dto';

export class FetchUserDto extends PartialType(FilterDto) {}
