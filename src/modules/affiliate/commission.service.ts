import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { chain, sumBy } from 'lodash';
import moment from 'moment';
import { Between, IsNull, MoreThan, Repository, TreeRepository } from 'typeorm';
import {
  COMMISSION_TYPES,
  Coin,
  FundOperation,
  TransactionType
} from '../transactions/dto/enum.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { EnumAffDirect, EnumAffRank } from './dto/enum.dto';
import { Affiliate } from './entities/affiliate.entity';
import { Commission } from './entities/commission.entity';
import { Income } from './entities/income.entity';
import { uuid } from 'uuidv4';
import { Transactions } from '../transactions/entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import { LeadershipService } from './leadership.service';
import { getSolPrice } from '../../shared/get-sol-price.shared';

// const DIRECT_F1_COMMISSION_PERCENT =
//   +process.env.DIRECT_F1_COMMISSION_PERCENT || 10;
const DIRECT_F1_COMMISSION_PERCENT =
  +process.env.DIRECT_F1_COMMISSION_PERCENT || 5;
const DIRECT_F2_COMMISSION_PERCENT =
  +process.env.DIRECT_F2_COMMISSION_PERCENT || 2;
const DIRECT_F3_COMMISSION_PERCENT =
  +process.env.DIRECT_F3_COMMISSION_PERCENT || 1;
const PEER_COMMISSION_PERCENT = +process.env.PEER_COMMISSION_PERCENT || 10;
const BINARY_COMMISSION_PERCENT = +process.env.BINARY_COMMISSION_PERCENT || 5;

const commissionRanks: Record<EnumAffRank, number> = {
  [EnumAffRank.NONE]: 0,
  [EnumAffRank.SOLANA]: 0.03,
  [EnumAffRank.BINANCE]: 0.025,
  [EnumAffRank.ETHEREUM]: 0.02,
  [EnumAffRank.BITCOIN]: 0.02,
  [EnumAffRank.SOLORIUM]: 0.015
};

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(Affiliate)
    private affRepository: Repository<Affiliate>,
    @InjectRepository(Commission)
    private commRepository: Repository<Commission>,
    @InjectRepository(Affiliate)
    private treeAffRepository: TreeRepository<Affiliate>,
    private readonly transactionsService: TransactionsService,
    @InjectRepository(Income)
    private incomeRepo: Repository<Income>,
    @InjectRepository(Transactions)
    private transactionsRepo: Repository<Transactions>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly leadershipService: LeadershipService
  ) {}

  async getRewards() {
    try {
      const allAffs = await this.affRepository.find({
        relations: ['children'],
        order: { position: 'ASC' }
      });

      if (allAffs?.length > 0) {
        const rewards = [];

        // await Promise.all(
        //   allAffs.map(async (aff) => {
        //     const reward = await commissionContract.rewardPendings(aff.address);
        //     rewards.push({
        //       address: aff.address,
        //       reward: reward / 10 ** 18
        //     });
        //   })
        // );

        return rewards;
      }
      return [];
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  // do direct commission F1, F2, F3
  async doDirectCommission(
    buyerAddress: string,
    packageBaseAmountSOL: number,
    solPrice: number
  ) {
    console.log(
      `[${moment
        .utc()
        .format(
          'dd - DD/MM/YYYY HH:mm:ss'
        )}] - [Commission][Begin] - Doing direct commission F1, F2, F3`
    );
    try {
      if (packageBaseAmountSOL <= 0) {
        return { message: 'No commission to distribute' };
      }

      const buyer = await this.affRepository.findOne({
        where: { address: buyerAddress },
      });

      if (!buyer) {
        throw new Error('Buyer not found');
      }

      const totalCommission = packageBaseAmountSOL;
      if (totalCommission <= 0)
        return { message: 'No commission to distribute' };

      // do commission
      if (totalCommission > 0) {
        // get F1
        // F1 là parent trực tiếp của người mua
        const f1 = await this.affRepository.findOne({
          where: { address: buyer.refAddress },
        });;

        // process F1 (5%)
        if (f1) {
          const f1User = await this.userRepository.findOne({
            walletAddress: f1.address
          });

          if (f1User) {
            // check maxout
            const isMaxedOut = await this.checkUserMaxout(f1User.id, solPrice);

            if (!isMaxedOut) {
              // hh F1
              const commAmount =
                (totalCommission * DIRECT_F1_COMMISSION_PERCENT) / 100;

              // check limit còn lại
              const totalReceived =
                await this.getTotalCommissionReceivedConvertToUSD(
                  f1User.id,
                  solPrice
                );
              const remainingAllowance =
                Number(f1User.currentMaxoutLimit) > 0
                  ? Number(f1User.currentMaxoutLimit) - totalReceived
                  : 0;

              let adjustedAmount = commAmount;
              if (
                Number(f1User.currentMaxoutLimit) > 0 &&
                remainingAllowance < commAmount
              ) {
                adjustedAmount =
                  remainingAllowance > 0 ? remainingAllowance : 0;
              }

              if (adjustedAmount > 0) {
                // Lưu log hoa hồng
                const newLog = this.commRepository.create({
                  address: f1.address,
                  amount: adjustedAmount,
                  amountUsdt: adjustedAmount * solPrice,
                  exchangeRate: solPrice,
                  type: COMMISSION_TYPES.DIRECT_F1_COMMISSION,
                  percent: DIRECT_F1_COMMISSION_PERCENT,
                  f0Commission: totalCommission,
                  note: `F1 Direct Commission ${buyerAddress}`
                } as Commission);
                await this.commRepository.save(newLog);

                // update F1 balance
                await this.updateUserBalance(
                  f1.address,
                  adjustedAmount,
                  TransactionType.DIRECT_F1_COMMISSION,
                  buyerAddress
                );

                // check lại F1 đã maxout sau khi nhận hoa hồng chưa
                const newTotalReceived = totalReceived + adjustedAmount;
                if (
                  newTotalReceived >= Number(f1User.currentMaxoutLimit) &&
                  Number(f1User.currentMaxoutLimit) > 0
                ) {
                  f1User.isMaxedOut = true;
                  await this.userRepository.save(f1User);
                }
              }

              // get F2
              const f2 = await this.affRepository.findOne({
                where: { address: f1.refAddress },
              });;

              // process F2 (2%)
              if (f2) {
                const f2User = await this.userRepository.findOne({
                  walletAddress: f2.address
                });

                if (f2User) {
                  // check maxout của F2
                  const isF2MaxedOut = await this.checkUserMaxout(
                    f2User.id,
                    solPrice
                  );

                  if (!isF2MaxedOut) {
                    const commAmountF2 =
                      (totalCommission * DIRECT_F2_COMMISSION_PERCENT) / 100;

                    // check limit còn lại của F2
                    const f2TotalReceived =
                      await this.getTotalCommissionReceivedConvertToUSD(
                        f2User.id,
                        solPrice
                      );
                    const f2RemainingAllowance =
                      Number(f2User.currentMaxoutLimit) > 0
                        ? Number(f2User.currentMaxoutLimit) - f2TotalReceived
                        : 0;

                    let adjustedAmountF2 = commAmountF2;
                    if (
                      Number(f2User.currentMaxoutLimit) > 0 &&
                      f2RemainingAllowance < commAmountF2
                    ) {
                      adjustedAmountF2 =
                        f2RemainingAllowance > 0 ? f2RemainingAllowance : 0;
                    }

                    if (adjustedAmountF2 > 0) {
                      const newLogF2 = this.commRepository.create({
                        address: f2.address,
                        amount: adjustedAmountF2,
                        amountUsdt: adjustedAmountF2 * solPrice,
                        exchangeRate: solPrice,
                        type: COMMISSION_TYPES.DIRECT_F2_COMMISSION,
                        percent: DIRECT_F2_COMMISSION_PERCENT,
                        f0Commission: totalCommission,
                        note: `F2 Direct Commission ${buyerAddress}`
                      } as Commission);
                      await this.commRepository.save(newLogF2);

                      // update F2 balance
                      await this.updateUserBalance(
                        f2.address,
                        adjustedAmountF2,
                        TransactionType.DIRECT_F2_COMMISSION,
                        buyerAddress
                      );

                      // check F2 đã maxout sau khi nhận hoa hồng chưa
                      const newF2TotalReceived =
                        f2TotalReceived + adjustedAmountF2;
                      if (
                        newF2TotalReceived >=
                          Number(f2User.currentMaxoutLimit) &&
                        Number(f2User.currentMaxoutLimit) > 0
                      ) {
                        f2User.isMaxedOut = true;
                        await this.userRepository.save(f2User);
                      }
                    }

                    // get F3
                    const f3 = await this.affRepository.findOne({
                      where: { address: f2.refAddress },
                    });;
                    // process F3 (1%)
                    if (f3) {
                      const f3User = await this.userRepository.findOne({
                        walletAddress: f3.address
                      });

                      if (f3User) {
                        // check maxout của F3
                        const isF3MaxedOut = await this.checkUserMaxout(
                          f3User.id,
                          solPrice
                        );

                        if (!isF3MaxedOut) {
                          const commAmountF3 =
                            (totalCommission * DIRECT_F3_COMMISSION_PERCENT) /
                            100;

                          // check limit còn lại của F3
                          const f3TotalReceived =
                            await this.getTotalCommissionReceivedConvertToUSD(
                              f3User.id,
                              solPrice
                            );
                          const f3RemainingAllowance =
                            Number(f3User.currentMaxoutLimit) > 0
                              ? Number(f3User.currentMaxoutLimit) -
                                f3TotalReceived
                              : 0;

                          let adjustedAmountF3 = commAmountF3;
                          if (
                            Number(f3User.currentMaxoutLimit) > 0 &&
                            f3RemainingAllowance < commAmountF3
                          ) {
                            adjustedAmountF3 =
                              f3RemainingAllowance > 0
                                ? f3RemainingAllowance
                                : 0;
                          }

                          if (adjustedAmountF3 > 0) {
                            const newLogF3 = this.commRepository.create({
                              address: f3.address,
                              amount: adjustedAmountF3,
                              amountUsdt: adjustedAmountF3 * solPrice,
                              exchangeRate: solPrice,
                              type: COMMISSION_TYPES.DIRECT_F3_COMMISSION,
                              percent: DIRECT_F3_COMMISSION_PERCENT,
                              f0Commission: totalCommission,
                              note: `F3 Direct Commission ${buyerAddress}`
                            } as Commission);
                            await this.commRepository.save(newLogF3);

                            // update F3 balance
                            await this.updateUserBalance(
                              f3.address,
                              adjustedAmountF3,
                              TransactionType.DIRECT_F3_COMMISSION,
                              buyerAddress
                            );

                            // check F3 đã maxout sau khi nhận hoa hồng chưa
                            const newF3TotalReceived =
                              f3TotalReceived + adjustedAmountF3;
                            if (
                              newF3TotalReceived >=
                                Number(f3User.currentMaxoutLimit) &&
                              Number(f3User.currentMaxoutLimit) > 0
                            ) {
                              f3User.isMaxedOut = true;
                              await this.userRepository.save(f3User);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return { message: 'Direct commission distribution completed!' };
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    } finally {
      console.log(
        `[${moment
          .utc()
          .format(
            'dd - DD/MM/YYYY HH:mm:ss'
          )}] - [Commission][End] - Doing direct commission F1, F2, F3`
      );
    }
  }

  // HH đồng cấp
  // F1 đồng hưởng 10% thu nhập (nhị phân) từ người giới thiệu trực tiếp nhận vào Chủ nhật
  @Cron('0 0 0 * * 0', { utcOffset: 0 })
  async doPeerCommission() {
    console.log(
      `[${moment
        .utc()
        .format(
          'dd - DD/MM/YYYY HH:mm:ss'
        )}] - [Commission][Begin] - Doing direct F1 commission`
    );
    try {
      const allAffs = await this.affRepository.find({
        relations: ['children'],
        order: { position: 'ASC' }
      });

      const startTime = moment().subtract(1, 'weeks').startOf('day');
      const endTime = moment().startOf('day');

      let binaryComms = await this.commRepository.find({
        where: {
          createdAt: Between(startTime.toDate(), endTime.toDate()),
          type: COMMISSION_TYPES.BINARY_COMMISSION
        }
      });
      binaryComms = binaryComms.map((x) => ({
        ...x,
        amount: +x.amount,
        amountUsdt: +x.amountUsdt,
        percent: +x.percent
      }));

      // Do commission
      const reduceComms = chain(binaryComms)
        .groupBy('address')
        .map((group, key) => ({
          address: key,
          amount: sumBy(group, 'amount'),
          amountUsdt: sumBy(group, 'amountUsdt'),
          percent: group[0].percent
        }))
        .value()
        .reduce<
          Record<
            string,
            {
              address: string;
              amount: number;
              amountUsdt: number;
              percent: number;
            }
          >
        >((obj, item) => ({ ...obj, [item.address]: item }), {});

      // Do commission
      if (allAffs?.length > 0) {
        const solPrice: number = await getSolPrice();
        await Promise.all(
          allAffs.map(async (aff) => {
            const totalCommissionUSDT = reduceComms[aff.address].amountUsdt;
            const totalCommissionSOL = totalCommissionUSDT / solPrice;

            if (aff.children.length > 0 && totalCommissionSOL > 0) {
              const directAffF1 = aff.children;
              if (directAffF1.length <= 2) {
                await Promise.all(
                  directAffF1.map(async (child) => {
                    const commAmountSOL =
                      (totalCommissionSOL * PEER_COMMISSION_PERCENT) /
                      (directAffF1.length * 100);
                    const newLog = this.commRepository.create({
                      address: child.address,
                      amount: commAmountSOL,
                      amountUsdt: commAmountSOL * solPrice,
                      exchangeRate: solPrice,
                      type: COMMISSION_TYPES.PEER_COMMISSION,
                      percent: DIRECT_F1_COMMISSION_PERCENT,
                      f0Commission: totalCommissionSOL
                    } as Commission);
                    await this.commRepository.save(newLog);
                    await this.updateUserBalance(
                      child.address,
                      commAmountSOL,
                      TransactionType.PEER_COMMISSION,
                      child.address
                    );
                  })
                );
              }
            }
          })
        );
      }

      return { message: 'Do commission is complete!' };
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    } finally {
      console.log(
        `[${moment
          .utc()
          .format(
            'dd - DD/MM/YYYY HH:mm:ss'
          )}] - [Commission][End] - Doing direct F1 commission`
      );
    }
  }

  // Do Rank commission
  @Cron('0 0 0 * * 1', { utcOffset: 0 })
  async doRankCommission() {
    console.log(
      `[${moment
        .utc()
        .format(
          'dd - DD/MM/YYYY HH:mm:ss'
        )}] - [Commission][Begin] - Doing rank commission`
    );
    try {
      const startTime = moment().subtract(1, 'weeks').startOf('day');
      const endTime = moment().startOf('day');
      const allAffs = await this.affRepository.find({
        order: { position: 'ASC' },
        where: {
          rank: MoreThan(0)
        }
      });

      // const allPackageLogsInWeek = await this.packageUserRepo.find({
      //   where: {
      //     createdAt: Between(startTime.toDate(), endTime.toDate())
      //   },
      //   order: { createdAt: 'DESC' }
      // });

      // const objPackageLogs = allPackageLogsInWeek.reduce<
      //   Record<string, PackageUser>
      // >((obj, item) => {
      //   const address = item.walletAddress;
      //   return obj[address] ? obj : { ...obj, [address]: item };
      // }, {});

      const countByRank = allAffs.reduce<Record<string, number>>(
        (obj, item) => {
          return { ...obj, [item.rank]: (obj[item.rank] || 0) + 1 };
        },
        {}
      );
      const solPrice: number = await getSolPrice();
      // await Promise.all(
      //   allAffs.map(async (aff) => {
      //     let totalIncomeUSDT = 0;
      //     // let totalIncomeSol = 0;
      //     let commissionAmountUSDT = 0;
      //     if (
      //       [
      //         EnumAffRank.SOLANA,
      //         EnumAffRank.BINANCE,
      //         EnumAffRank.ETHEREUM
      //       ].includes(aff.rank)
      //     ) {
      //       const descendants = await this.treeAffRepository.findDescendants(
      //         aff
      //       );
      //       totalIncomeUSDT += objPackageLogs[aff.address].totalUsdt;

      //       for (const node of descendants) {
      //         if (node.rank === aff.rank) continue;
      //         const packageLogs = objPackageLogs[node.address];
      //         totalIncomeUSDT += packageLogs.totalUsdt;
      //       }
      //       commissionAmountUSDT = totalIncomeUSDT * commissionRanks[aff.rank];
      //     }

      //     if ([EnumAffRank.BITCOIN, EnumAffRank.SOLORIUM].includes(aff.rank)) {
      //       totalIncomeUSDT = Object.values(objPackageLogs).reduce(
      //         (sum, item) => sum + item.totalUsdt,
      //         0
      //       );
      //       commissionAmountUSDT =
      //         (totalIncomeUSDT * commissionRanks[aff.rank]) /
      //         countByRank[aff.rank];
      //     }

      //     if (commissionAmountUSDT && totalIncomeUSDT) {
      //       const commissionAmountSol = commissionAmountUSDT / solPrice;
      //       const newLog = this.commRepository.create({
      //         address: aff.address,
      //         amount: commissionAmountSol,
      //         amountUsdt: commissionAmountUSDT,
      //         exchangeRate: solPrice,
      //         type: COMMISSION_TYPES.RANK_COMMISSION,
      //         percent: commissionRanks[aff.rank] * 100,
      //         rank: aff.rank,
      //         f0Commission: totalIncomeUSDT / solPrice
      //       });
      //       await this.commRepository.save(newLog);
      //       await this.updateUserBalance(
      //         aff.address,
      //         commissionAmountSol,
      //         TransactionType.RANK_COMMISSION,
      //         aff.address
      //       );
      //     }
      //   })
      // );

      return { message: 'Do commission is complete!' };
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    } finally {
      console.log(
        `[${moment
          .utc()
          .format(
            'dd - DD/MM/YYYY HH:mm:ss'
          )}] - [Commission][End] - Doing direct F1 commission`
      );
    }
  }

  async getCommissionHistory(address: string) {
    try {
      const history = await this.commRepository.find({
        where: { address },
        order: { createdAt: 'DESC' }
      });
      return history.map((x) => ({ ...x, reason: x.type.toLowerCase() }));
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  private async calculateBranchIncome(affiliate: Affiliate): Promise<number> {
    let totalIncome = 0;
    const descendants = await this.treeAffRepository.findDescendants(affiliate);
    // for (const node of descendants) {
    //   const packageUsers = await this.packageUserRepo.find({
    //     where: {
    //       walletAddress: node.address,
    //       deletedAt: IsNull()
    //     },
    //     order: { createdAt: 'DESC' }
    //   });
    //   totalIncome += packageUsers.reduce(
    //     (sum, item) => sum + item.totalAmount,
    //     0
    //   );
    // }

    return totalIncome;
  }

  async calculateBinaryCommission(
    parent: Affiliate,
    reason = '',
    modifiedChild: Affiliate,
    totalAmountSol: number,
    solPrice: number
  ) {
    const parentDetail = await this.affRepository.findOne({
      where: { address: parent.address },
      relations: ['children']
    });

    if (!parentDetail) return;

    // check maxout của parent trước khi tính binary commission
    const parentUser = await this.userRepository.findOne({
      where: { walletAddress: parent.address }
    });

    if (!parentUser) return;

    // kiểm tra do nhánh yếu mua mới tính hh
    const leftChild = parentDetail.children.find(
      (x) => x.direction === EnumAffDirect.LEFT
    );
    const rightChild = parentDetail.children.find(
      (x) => x.direction === EnumAffDirect.RIGHT
    );
    if (
      leftChild?.address === modifiedChild.address ||
      rightChild?.address === modifiedChild.address
    ) {
      const totalInLeftBranch = leftChild
        ? await this.calculateBranchIncome(leftChild)
        : Infinity;
      const totalInRightBranch = rightChild
        ? await this.calculateBranchIncome(rightChild)
        : Infinity;

      if (
        !(
          (totalInLeftBranch < totalInRightBranch &&
            leftChild?.address === modifiedChild.address) ||
          (totalInRightBranch < totalInLeftBranch &&
            rightChild?.address === modifiedChild.address)
        )
      )
        return;
    }

    // check nếu parent đã maxout
    const isParentMaxedOut = await this.checkUserMaxout(
      parentUser.id,
      solPrice
    );

    if (isParentMaxedOut) {
      // đã maxout, không tính binary commission nữa
      console.log(
        `User ${parent.address} has maxed out. Binary commission skipped.`
      );

      // tiếp tục tính cho cấp trên
      return this.calculateBinaryCommission(
        parent.parent,
        reason,
        modifiedChild,
        totalAmountSol,
        solPrice
      );
    }

    if (parentDetail.children.length !== 2)
      return this.calculateBinaryCommission(
        parent.parent,
        reason,
        modifiedChild,
        totalAmountSol,
        solPrice
      );

    let commissionAmount = totalAmountSol * (BINARY_COMMISSION_PERCENT / 100);

    if (commissionAmount > 0) {
      // check giới hạn hoa hồng còn lại có thể nhận
      const totalReceived = await this.getTotalCommissionReceivedConvertToUSD(
        parentUser.id,
        solPrice
      );
      const remainingAllowance =
        Number(parentUser.currentMaxoutLimit) - totalReceived;

      if (
        remainingAllowance <= 0 &&
        Number(parentUser.currentMaxoutLimit) > 0
      ) {
        // đã maxout
        parentUser.isMaxedOut = true;
        await this.userRepository.save(parentUser);

        console.log(
          `User ${parent.address} has reached maxout limit. Binary commission rejected.`
        );

        return this.calculateBinaryCommission(
          parent.parent,
          reason,
          modifiedChild,
          totalAmountSol,
          solPrice
        );
      }

      // chỉnh số tiền nếu vượt quá giới hạn
      if (
        commissionAmount > remainingAllowance &&
        Number(parentUser.currentMaxoutLimit) > 0
      ) {
        commissionAmount = remainingAllowance;
      }

      // const solPrice: number = await getSolPrice();
      const newComm = this.commRepository.create({
        address: parent.address,
        amount: commissionAmount,
        amountUsdt: commissionAmount * solPrice,
        exchangeRate: solPrice,
        type: COMMISSION_TYPES.BINARY_COMMISSION,
        percent: BINARY_COMMISSION_PERCENT,
        f0Commission: totalAmountSol,
        note: reason
      });

      await this.commRepository.save(newComm);

      await this.updateUserBalance(
        parent.address,
        commissionAmount,
        TransactionType.BINARY_COMMISSION,
        parent.address
      );

      // check đã đạt ngưỡng maxout sau khi nhận binary commission
      const newTotalReceived = totalReceived + commissionAmount;
      if (
        newTotalReceived >= Number(parentUser.currentMaxoutLimit) &&
        Number(parentUser.currentMaxoutLimit) > 0
      ) {
        parentUser.isMaxedOut = true;
        await this.userRepository.save(parentUser);
        console.log(
          `User ${parent.address} has reached maxout limit after receiving binary commission.`
        );
      }
    }

    return this.calculateBinaryCommission(
      parent.parent,
      reason,
      modifiedChild,
      totalAmountSol,
      solPrice
    );
  }

  private async updateUserBalance(
    address: string,
    amount: number,
    type: string,
    fromAddress: string
  ) {
    const aff = await this.affRepository.findOne({
      where: { address }
    });

    if (!aff) {
      console.log(`[Commission] Cannot find affiliate with address ${address}`);
      return;
    }

    const user = await this.userRepository.findOne({
      where: { walletAddress: address }
    });

    await this.transactionsService.updateFund(
      {
        amount,
        operation: FundOperation.ADD,
        coin: Coin.SOL,
        transactionType: TransactionType[type],
        comment: `${type} Commission from ${fromAddress}`,
        uuid: uuid(),
        walletAddress: address
      },
      user.id
    );
  }

  async getTotalCommissionReceivedConvertToUSD(
    userId: number,
    solPrice?: number
  ): Promise<number> {
    if (!solPrice) {
      solPrice = await getSolPrice();
      if (!(solPrice > 0)) {
        throw new HttpException("Can't get SOL price", HttpStatus.BAD_REQUEST);
      }
    }

    const commissionTypes = [
      TransactionType.DIRECT_F1_COMMISSION,
      TransactionType.DIRECT_F2_COMMISSION,
      TransactionType.DIRECT_F3_COMMISSION,
      TransactionType.BINARY_COMMISSION,
      TransactionType.RANK_COMMISSION,
      TransactionType.PEER_COMMISSION
    ];

    const result = await this.transactionsRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.coin = :coin', { coin: Coin.SOL })
      .andWhere('transaction.transactionType IN (:...types)', {
        types: commissionTypes
      })
      .getRawOne();

    const totalCommissionSOL = parseFloat(result.total) || 0;
    const totalCommisionUSD = totalCommissionSOL * solPrice;

    return totalCommisionUSD || 0;
  }

  async checkUserMaxout(userId: number, solPrice?: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (user.isMaxedOut) {
      return true;
    }

    // tính tổng hoa hồng đã nhận
    const totalCommissionReceived =
      await this.getTotalCommissionReceivedConvertToUSD(userId, solPrice);

    // đạt ngưỡng maxout, update isMaxout
    if (
      totalCommissionReceived >= Number(user.currentMaxoutLimit) &&
      Number(user.currentMaxoutLimit) > 0
    ) {
      user.isMaxedOut = true;
      await this.userRepository.save(user);
      return true;
    }

    return false;
  }

  // private async getTotalCommissionFromTransactions(
  //   address: string,
  //   addWeek = 0
  // ): Promise<number> {
  //   const aff = await this.affRepository.findOne({
  //     where: { address }
  //   });

  //   if (!aff) {
  //     return 0;
  //   }

  //   // thời gian đầu tuần và cuối tuần
  //   const startOfWeek = moment()
  //     .utc()
  //     .startOf('isoWeek')
  //     .add(addWeek, 'week')
  //     .toDate();
  //   const endOfWeek = moment()
  //     .utc()
  //     .endOf('isoWeek')
  //     .add(addWeek, 'week')
  //     .toDate();

  //   const transactions = await this.transactionsRepo.find({
  //     where: {
  //       walletAddress: address,
  //       transactionType: In([
  //         TransactionType.DIRECT_F1_COMMISSION,
  //         TransactionType.DIRECT_F2_COMMISSION,
  //         TransactionType.DIRECT_F3_COMMISSION
  //       ]),
  //       coin: Coin.SOLR,
  //       status: 'SUCCESS',
  //       createdAt: Between(startOfWeek, endOfWeek)
  //     }
  //   });

  //   // tổng amount
  //   if (transactions.length > 0) {
  //     return transactions.reduce((total, tx) => total + Number(tx.amount), 0);
  //   }

  //   return 0;
  // }

  // async getTotalCommission(address: string) {
  //   try {
  //     const aff = await this.affRepository.findOne({
  //       where: { address },
  //       relations: ['parent', 'parent.children']
  //     });

  //     if (!aff) {
  //       throw { message: 'Aff not found!' };
  //     }

  //     const sumCalculated = await this.tmpCommRepo
  //       .createQueryBuilder('tmp_weak_branch_commission')
  //       .select('SUM(amount)', 'totalComm')
  //       .groupBy('tmp_weak_branch_commission.address')
  //       .where('address = :address', { address })
  //       .getRawOne();

  //     // calc direct commissions for F1, F2, F3
  //     let totalF1Commission = 0;
  //     let totalF2Commission = 0;
  //     let totalF3Commission = 0;

  //     if (aff.parent) {
  //       // calc hh F1
  //       // const totalF0Payout = await this.graphqlService.getTotalPayoutMatic(
  //       //   aff.parent.address
  //       // );
  //       // từ transactions
  //       const totalF0Payout = await this.getTotalCommissionFromTransactions(
  //         aff.parent.address,
  //         0 // lấy tuần hiện tại
  //       );

  //       if (totalF0Payout > 0) {
  //         totalF1Commission =
  //           (totalF0Payout * DIRECT_F1_COMMISSION_PERCENT) / 100;
  //       }

  //       // calc hh F2
  //       const grandParent = await this.treeAffRepository.findAncestors(
  //         aff.parent
  //       );
  //       if (grandParent?.length > 0) {
  //         // const totalGrandParentPayout = await this.graphqlService.getTotalPayoutMatic(
  //         //     grandParent[0].address
  //         // );
  //         // từ transactions
  //         const totalGrandParentPayout =
  //           await this.getTotalCommissionFromTransactions(
  //             grandParent[0].address,
  //             0 // lấy tuần hiện tại
  //           );

  //         if (totalGrandParentPayout > 0) {
  //           totalF2Commission =
  //             (totalGrandParentPayout * DIRECT_F2_COMMISSION_PERCENT) / 100;
  //         }
  //       }

  //       // calc hh F3
  //       if (grandParent?.length > 1) {
  //         // const totalGreatGrandParentPayout = await this.graphqlService.getTotalPayoutMatic(
  //         //     grandParent[1].address
  //         // )
  //         // từ transactions
  //         const totalGreatGrandParentPayout =
  //           await this.getTotalCommissionFromTransactions(
  //             grandParent[1].address,
  //             0 // lấy tuần hiện tại
  //           );

  //         if (totalGreatGrandParentPayout > 0) {
  //           totalF3Commission =
  //             (totalGreatGrandParentPayout * DIRECT_F3_COMMISSION_PERCENT) /
  //             100;
  //         }
  //       }
  //     }

  //     // get commission history
  //     const f1CommHistory = await this.commRepository.find({
  //       where: { address, type: 'direct f1' },
  //       order: { createdAt: 'DESC' }
  //     });

  //     const f2CommHistory = await this.commRepository.find({
  //       where: { address, type: 'direct f2' },
  //       order: { createdAt: 'DESC' }
  //     });

  //     const f3CommHistory = await this.commRepository.find({
  //       where: { address, type: 'direct f3' },
  //       order: { createdAt: 'DESC' }
  //     });

  //     const wbCommHistory = await this.weakBranchCommRepo.find({ address });

  //     const allCommHistory = [
  //       ...f1CommHistory.map((x) => ({ ...x, reason: 'Direct F1 Commission' })),
  //       ...f2CommHistory.map((x) => ({ ...x, reason: 'Direct F2 Commission' })),
  //       ...f3CommHistory.map((x) => ({ ...x, reason: 'Direct F3 Commission' })),
  //       ...wbCommHistory
  //     ];

  //     return {
  //       totalComm: +sumCalculated?.totalComm || 0,
  //       totalF1Comm: totalF1Commission,
  //       totalF2Comm: totalF2Commission,
  //       totalF3Comm: totalF3Commission,
  //       totalDirectComm:
  //         totalF1Commission + totalF2Commission + totalF3Commission,
  //       totalWBComm: +sumCalculated?.totalComm || 0,
  //       commHistory: allCommHistory.sort(
  //         (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  //       )
  //     };
  //   } catch (e: any) {
  //     throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
  //   }
  // }
}
