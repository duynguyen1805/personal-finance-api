import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, Repository, TreeRepository } from 'typeorm';
import { Affiliate } from './entities/affiliate.entity';
import { CommissionService } from './commission.service';
import { EnumAffDirect, EnumAffRank } from './dto/enum.dto';
import moment from 'moment';
import { Coin, TransactionType } from '../transactions/dto/enum.dto';
import { Transactions } from '../transactions/entities/transaction.entity';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
// @Injectable()
// export class LeadershipService {
//   private readonly LEADERSHIP_REQUIREMENTS = {
//     [EnumAffRank.SOLANA]: {
//       minF1Count: 3,
//       totalVolume: 50000,
//       weakBranchVolume: 20000,
//       requiredF1Level: EnumAffRank.NONE
//     },
//     [EnumAffRank.BINANCE]: {
//       minF1Count: 2,
//       totalVolume: 200000,
//       weakBranchVolume: 50000,
//       requiredF1Level: EnumAffRank.SOLANA
//     },
//     [EnumAffRank.ETHEREUM]: {
//       minF1Count: 2,
//       totalVolume: 500000,
//       weakBranchVolume: 200000,
//       requiredF1Level: EnumAffRank.BINANCE
//     },
//     [EnumAffRank.BITCOIN]: {
//       minF1Count: 2,
//       totalVolume: 1000000,
//       weakBranchVolume: 300000,
//       requiredF1Level: EnumAffRank.ETHEREUM
//     },
//     [EnumAffRank.SOLORIUM]: {
//       minF1Count: 2,
//       totalVolume: 2500000,
//       weakBranchVolume: 1000000,
//       requiredF1Level: EnumAffRank.BITCOIN
//     }
//   };

//   constructor(
//     @InjectRepository(Affiliate)
//     private affRepository: TreeRepository<Affiliate>,
//     // private readonly commissionService: CommissionService,
//     @InjectRepository(Transactions)
//     private transactionsRepo: Repository<Transactions>,
//     private readonly configService: ConfigService,
//   ) {}

//   @Cron('*/30 * * * * *', { utcOffset: 0 }) // 30s/time
//   async checkAndUpdateAllLeaderships() {
//     const env = this.configService.get('ENV');
//     if (env == 'local') return;
//     try {
//       console.log(
//         `[${moment().utc().format('DD/MM/YYYY HH:mm:ss')}] Start checking all leaderships`
//       );

//       // lấy tất cả affiliate
//       const affiliates = await this.affRepository.find({
//         relations: ['children']
//       });

//       for (const affiliate of affiliates) {
//         try {
//           await this.checkAndUpdateLeadershipForAffiliate(affiliate);
//         } catch (error) {
//           console.error(
//             `Error updating leadership for ${affiliate.address}: ${error.message}`
//           );
//           continue;
//         }
//       }

//       console.log(
//         `[${moment().utc().format('DD/MM/YYYY HH:mm:ss')}] Finished checking all leaderships`
//       );
//     } catch (error) {
//       console.error(`Error in checkAndUpdateAllLeaderships: ${error.message}`);
//     }
//   }

//   async checkAndUpdateLeadershipForAffiliate(affiliate: Affiliate): Promise<void> {
//     try {
//       // check cao => thấp
//       if (await this.checkSoloriumRequirements(affiliate)) {
//         affiliate.rank = EnumAffRank.SOLORIUM;
//       } else if (await this.checkBitcoinRequirements(affiliate)) {
//         affiliate.rank = EnumAffRank.BITCOIN;
//       } else if (await this.checkEthereumRequirements(affiliate)) {
//         affiliate.rank = EnumAffRank.ETHEREUM;
//       } else if (await this.checkBinanceRequirements(affiliate)) {
//         affiliate.rank = EnumAffRank.BINANCE;
//       } else if (await this.checkSolanaRequirements(affiliate)) {
//         affiliate.rank = EnumAffRank.SOLANA;
//       } else {
//         affiliate.rank = EnumAffRank.NONE;
//       }

//       await this.affRepository.save(affiliate);
//       console.log(`Updated leadership for ${affiliate.address} to ${affiliate.rank}`);
      
//     } catch (error) {
//       throw new Error(
//         `Failed to update leadership for ${affiliate.address}: ${error.message}`
//       );
//     }
//   }

//   async checkAndUpdateLeadership(address: string): Promise<void> {
//     const affiliate = await this.affRepository.findOne({
//       where: { address },
//       relations: ['children']
//     });

//     if (!affiliate) {
//       throw new HttpException(
//         `Affiliate not found: ${address}`,
//         HttpStatus.BAD_REQUEST
//       );
//     }

//     await this.checkAndUpdateLeadershipForAffiliate(affiliate);
//   }

//   private async checkLevelRequirements(
//     affiliate: Affiliate,
//     level: EnumAffRank
//   ): Promise<boolean> {
//     try {
//       const requirements = this.LEADERSHIP_REQUIREMENTS[level];

//       // 1. check số lượng F1 có level theo require
//       const qualifiedF1Count = affiliate.children.filter(
//         child => child.rank === requirements.requiredF1Level
//       ).length;

//       if (qualifiedF1Count < requirements.minF1Count) {
//         return false;
//       }

//       // 2. check tổng doanh số
//       const totalVolume = await this.getTotalVolume(affiliate);
//       if (totalVolume < requirements.totalVolume) {
//         return false;
//       }

//       // 3. check doanh số nhánh yếu
//       const weakBranchVolume = await this.getWeakBranchVolume(affiliate);
//       if (weakBranchVolume < requirements.weakBranchVolume) {
//         return false;
//       }

//       return true;
//     } catch (error) {
//       console.log(
//         `Error checking ${level} requirements for ${affiliate.address}: ${error.message}`
//       );
//       return false;
//     }
//   }

//   private async checkSoloriumRequirements(affiliate: Affiliate): Promise<boolean> {
//     return this.checkLevelRequirements(affiliate, EnumAffRank.SOLORIUM);
//   }

//   private async checkBitcoinRequirements(affiliate: Affiliate): Promise<boolean> {
//     return this.checkLevelRequirements(affiliate, EnumAffRank.BITCOIN);
//   }

//   private async checkEthereumRequirements(affiliate: Affiliate): Promise<boolean> {
//     return this.checkLevelRequirements(affiliate, EnumAffRank.ETHEREUM);
//   }

//   private async checkBinanceRequirements(affiliate: Affiliate): Promise<boolean> {
//     return this.checkLevelRequirements(affiliate, EnumAffRank.BINANCE);
//   }

//   private async checkSolanaRequirements(affiliate: Affiliate): Promise<boolean> {
//     return this.checkLevelRequirements(affiliate, EnumAffRank.SOLANA);
//   }

//   private async getTotalVolume(affiliate: Affiliate): Promise<number> {
//     if (affiliate.totalVolume > 0) {
//       return affiliate.totalVolume;
//     }

//     const totalVolume = await this.getTotalBranchVolume(affiliate);
    
//     // cache lại volume
//     affiliate.totalVolume = totalVolume;
//     await this.affRepository.save(affiliate);

//     return totalVolume;
//   }

//   private async getWeakBranchVolume(affiliate: Affiliate): Promise<number> {
//     if (affiliate.weakBranchVolume > 0) {
//       return affiliate.weakBranchVolume;
//     }

//     const leftBranch = affiliate.children
//       .find(child => child.direction === EnumAffDirect.LEFT);
//     const rightBranch = affiliate.children
//       .find(child => child.direction === EnumAffDirect.RIGHT);

//     const leftVolume = leftBranch ? 
//       await this.getTotalBranchVolume(leftBranch) : 0;
//     const rightVolume = rightBranch ?
//       await this.getTotalBranchVolume(rightBranch) : 0;

//     const weakBranchVolume = Math.min(leftVolume, rightVolume);

//     // cache lại volume
//     affiliate.weakBranchVolume = weakBranchVolume;
//     await this.affRepository.save(affiliate);

//     return weakBranchVolume;
//   }

//   private async getTotalBranchVolume(
//     affiliate: Affiliate
//   ): Promise<number> {
//     // lấy tất cả descendants
//     // tính tổng volume của tất cả descendants
//     const descendants = await this.affRepository.createDescendantsQueryBuilder('affiliate', 'affiliate_closure', affiliate)
//       .getMany();

//     let totalVolume = 0;
//     for (const desc of descendants) {
//       totalVolume += await this.getTotalCommissionFromTransactions(desc.address);
//     }

//     return totalVolume;
//   }

//   private async getTotalCommissionFromTransactions(
//     address: string,
//   ): Promise<number> {
//     const aff = await this.affRepository.findOne({
//       where: { address }
//     });

//     if (!aff) {
//       return 0;
//     }

//     // const totalAmountPackage = await this.packageUserRepo.find({
//     //   where: {
//     //     walletAddress: address,
//     //     deletedAt: IsNull()
//     //   }
//     // })
//     const totalAmountPackage = [];

//     // tổng amount user mua package, tính theo USD
//     if (totalAmountPackage.length > 0) {
//       return totalAmountPackage.reduce((total, tx) => total + Number(tx.totalUsdt), 0);
//     }

//     return 0;
//   }

//   async getLeadershipStatus(address: string) {
//     // trả về thông tin level hiện tại:
//     // - level
//     // - tổng doanh số
//     // - doanh số nhánh yếu
//     // - số F1 đạt yêu cầu
//     // - require của level hiện tại

//     const affiliate = await this.affRepository.findOne({
//       where: { address },
//       relations: ['children']
//     });

//     if (!affiliate) {
//       throw new HttpException(`Affiliate not found: ${address}`, HttpStatus.BAD_REQUEST);
//     }

//     const totalVolume = await this.getTotalVolume(affiliate);
//     const weakBranchVolume = await this.getWeakBranchVolume(affiliate);
//     const qualifiedF1Count = affiliate.children.filter(
//       child => child.rank >= affiliate.rank
//     ).length;

//     return {
//       currentLevel: affiliate.rank,
//       totalVolume,
//       weakBranchVolume,
//       qualifiedF1Count,
//       requirements: this.LEADERSHIP_REQUIREMENTS[affiliate.rank]
//     };
//   }

//   async getNextLevelRequirements(address: string) {
//     const affiliate = await this.affRepository.findOne({
//       where: { address }
//     });

//     if (!affiliate) {
//       throw new HttpException(`Affiliate not found: ${address}`, HttpStatus.BAD_REQUEST);
//     }

//     const currentLevel = affiliate.rank;
//     const nextLevel = this.getNextLevel(currentLevel);

//     if (!nextLevel) {
//       return {
//         message: 'Already at highest level',
//         currentLevel
//       };
//     }

//     return {
//       currentLevel,
//       nextLevel,
//       requirements: this.LEADERSHIP_REQUIREMENTS[nextLevel]
//     };
//   }

//   private getNextLevel(currentLevel: EnumAffRank): EnumAffRank | null {
//     const levels = [
//       EnumAffRank.NONE,
//       EnumAffRank.SOLANA,
//       EnumAffRank.BINANCE,
//       EnumAffRank.ETHEREUM,
//       EnumAffRank.BITCOIN,
//       EnumAffRank.SOLORIUM
//     ];

//     const currentIndex = levels.indexOf(currentLevel);
//     return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
//   }

//   async getNetworkStats(address: string) {
//     // trả về thống kê toàn network:
//     // - thống kê theo level
//     // - thống kê F1
//     // - thống kê tổng thể network
//     // - thống kê 7 ngày gần nhất

//     try {
//       const affiliate = await this.affRepository.findOne({
//         where: { address },
//         relations: ['children']
//       });

//       if (!affiliate) {
//         throw new HttpException(`Affiliate not found: ${address}`, HttpStatus.BAD_REQUEST);
//       }

//       // lấy tất cả descendants
//       const descendants = await this.affRepository.findDescendants(affiliate);

//       // thống kê theo level
//       const levelStats = {
//         [EnumAffRank.NONE]: 0,
//         [EnumAffRank.SOLANA]: 0,
//         [EnumAffRank.BINANCE]: 0,
//         [EnumAffRank.ETHEREUM]: 0,
//         [EnumAffRank.BITCOIN]: 0,
//         [EnumAffRank.SOLORIUM]: 0
//       };

//       // thống kê F1
//       const f1Stats = {
//         total: affiliate.children.length,
//         byLevel: {
//           [EnumAffRank.NONE]: 0,
//           [EnumAffRank.SOLANA]: 0,
//           [EnumAffRank.BINANCE]: 0,
//           [EnumAffRank.ETHEREUM]: 0,
//           [EnumAffRank.BITCOIN]: 0,
//           [EnumAffRank.SOLORIUM]: 0
//         }
//       };

//       // cập nhật thống kê F1
//       for (const f1 of affiliate.children) {
//         f1Stats.byLevel[f1.rank]++;
//       }

//       // thống kê tổng thể network
//       const networkStats = {
//         totalMembers: descendants.length,
//         totalVolume: await this.getTotalVolume(affiliate),
//         weakBranchVolume: await this.getWeakBranchVolume(affiliate),
//         leftBranchStats: {
//           members: 0,
//           volume: 0
//         },
//         rightBranchStats: {
//           members: 0,
//           volume: 0
//         }
//       };

//       // cập nhật thống kê theo level cho toàn bộ network
//       for (const member of descendants) {
//         levelStats[member.rank]++;
//       }

//       // tính toán thống kê cho từng nhánh
//       const leftBranch = affiliate.children
//         .find(child => child.direction === EnumAffDirect.LEFT);
//       const rightBranch = affiliate.children
//         .find(child => child.direction === EnumAffDirect.RIGHT);

//       if (leftBranch) {
//         const leftDescendants = await this.affRepository.findDescendants(leftBranch);
//         networkStats.leftBranchStats = {
//           members: leftDescendants.length,
//           volume: await this.getTotalBranchVolume(leftBranch)
//         };
//       }

//       if (rightBranch) {
//         const rightDescendants = await this.affRepository.findDescendants(rightBranch);
//         networkStats.rightBranchStats = {
//           members: rightDescendants.length,
//           volume: await this.getTotalBranchVolume(rightBranch)
//         };
//       }

//       // thống kê theo thời gian (7 ngày gần nhất)
//       const recentStats = await this.getRecentStats(address);

//       return {
//         currentLevel: affiliate.rank,
//         nextLevelRequirements: await this.getNextLevelRequirements(address),
//         f1Stats,
//         networkStats,
//         levelStats,
//         recentStats
//       };
//     } catch (error) {
//       throw new HttpException(
//         `Error getting network stats: ${error.message}`,
//         HttpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   private async getRecentStats(address: string) {
//     const last7Days = Array.from({ length: 7 }, (_, i) => {
//       return {
//         date: moment().subtract(i, 'days').format('YYYY-MM-DD'),
//         volume: 0,
//         newMembers: 0
//       };
//     }).reverse();

//     // lấy doanh số 7 ngày gần nhất
//     for (const day of last7Days) {
//       const startOfDay = moment(day.date).startOf('day').toDate();
//       const endOfDay = moment(day.date).endOf('day').toDate();

//       // lấy doanh số trong ngày
//       const transactions = []
//       // await this.transactionsRepo.find({
//       //   where: {
//       //     walletAddress: address,
//       //     coin: Coin.USDT,
//       //     transactionType: TransactionType.BUY_PACKAGE,
//       //     status: 'SUCCESS',
//       //     createdAt: Between(startOfDay, endOfDay)
//       //   }
//       // });

//       day.volume = transactions.reduce(
//         (sum, tx) => sum + Number(tx.amount),
//         0
//       );

//       // đếm số thành viên mới trong ngày
//       const newMembers = await this.affRepository.count({
//         where: {
//           createdAt: Between(startOfDay, endOfDay)
//         }
//       });

//       day.newMembers = newMembers;
//     }

//     return {
//       dailyStats: last7Days,
//       totalNewMembers: last7Days.reduce((sum, day) => sum + day.newMembers, 0),
//       totalVolume: last7Days.reduce((sum, day) => sum + day.volume, 0)
//     };
//   }
// }
