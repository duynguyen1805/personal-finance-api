import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { AffiliateService } from './affiliate.service';
import { CommissionService } from './commission.service';
import { GetAffParentDto } from './dto/get-parent.dto';
import { getDescendantsByDepthDto, MoveSubTreeDto } from './dto/move-sub-tree.dto';
import { RollbackSubTreeDto } from './dto/rollback-sub-tree.dto';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';

@ApiTags('affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(
    private readonly affiliateService: AffiliateService,
    private readonly commissionService: CommissionService,
    @Inject(REQUEST) private request: Request
  ) {}

  @Get(':address')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  getTree(@Param('address') address: string) {
    // const user = this.request.user as User;
    return this.affiliateService.getTree(address);
  }

  @Get('parent/:address')
  findParent(@Param('address') address: string, @Query() dto: GetAffParentDto) {
    return this.affiliateService.findParent(address, dto);
  }

  @Post()
  async create(@Body() dto: CreateAffiliateDto) {
    const res = await this.affiliateService.addChild(dto);
    return res;
  }

  @Get(':address/:depth')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  getTreeByDepth(@Param('address') address: string, @Param('depth') depth: number) {
    // const user = this.request.user as User;
    return this.affiliateService.getTreeByDepth(address);
  }

  // @Post('upgrade-package')
  // async upgradePackage(@Body() dto: UpgradePackageDto) {
  //   const res = await this.affiliateService.upgradePackage(dto);
  //   if (res && res.data) {
  //     await new Promise((r) => setTimeout(r, 60000));
  //     await this.commissionService.saveWeakBranchComm(
  //       res?.data?.address,
  //       `Upgrade package - ${dto.address} (${dto.packageAmount} matic)`,
  //       dto.hash
  //     );
  //   }
  //   return res;
  // }

  // @Post('move-sub-tree')
  // async moveSubTree(@Body() dto: MoveSubTreeDto) {
  //   const res = await this.affiliateService.moveSubTree(dto);
  //   return res;
  // }

  // @Get('count-descendants/:address')
  // async countAffiliateDescendants(@Param('address') address: string) {
  //   return this.affiliateService.countAffiliateDescendants(address);
  // }

  // @Post('rollback-move-sub-tree')
  // async rollbackMoveSubTree(@Body() dto: RollbackSubTreeDto) {
  //   const res = await this.affiliateService.rollbackMoveSubTreeAutoDirection(dto);
  //   return res;
  // }

  // @Post('get-descendants-by-depth')
  // async getDescendantsByDepth(@Body() dto: getDescendantsByDepthDto) {
  //   const res = await this.affiliateService.getDescendantsByDepth(dto.address, dto.maxDepth);
  //   return res;
  // }
}
