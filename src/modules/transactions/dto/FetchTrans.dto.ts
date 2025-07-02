import { PartialType } from '@nestjs/swagger';
import { FilterDto } from '../../../common/dto/filter.dto';

export class FetchTransDto extends PartialType(FilterDto) {}
