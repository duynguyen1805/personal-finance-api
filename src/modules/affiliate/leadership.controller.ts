// // import { LeadershipService } from "./leadership.service";
// import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
// import { AffiliateService } from './affiliate.service';
// import { ApiTags } from '@nestjs/swagger';

// @ApiTags('leadership')
// @Controller('leadership')
// export class LeadershipController {
//   constructor(
//     private readonly leadershipService: LeadershipService
//   ) {}

//   @Get(':address/status')
//   async getLeadershipStatus(@Param('address') address: string) {
//     return this.leadershipService.getLeadershipStatus(address);
//   }

//   @Get(':address/next-level-requirements')
//   async getNextLevelRequirements(@Param('address') address: string) {
//     return this.leadershipService.getNextLevelRequirements(address);
//   }

//   @Get(':address/network-stats')
//   async getNetworkStats(@Param('address') address: string) {
//     return this.leadershipService.getNetworkStats(address);
//   }

// //   @Get(':address/level')
// //   async getLeadershipLevel(
// //     @Param('address') address: string
// //   ) {
// //     return this.leadershipService.getLeadershipInfo(address);
// //   }

//   @Get(':address/requirements')
//   async getLeadershipRequirements(
//     @Param('address') address: string
//   ) {
//     return this.leadershipService.getNextLevelRequirements(address);
//   }
// }