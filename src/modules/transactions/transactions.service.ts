import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import {
  Coin,
  ERmqQueueName,
  FundOperation,
  TransactionStatus,
  TransactionType,
  WithdrawType
} from './dto/enum.dto';
import { FetchTransDto } from './dto/FetchTrans.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { Transactions } from './entities/transaction.entity';
import nacl from 'tweetnacl';
import { decodeUTF8 } from 'tweetnacl-util';
import { User } from '../user/entities/user.entity';
import { getSOLRBalance } from '../../shared/get-solr-balance';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';
import { ClientProxy } from '@nestjs/microservices';
import { WithdrawCommissionDto } from './dto/withdraw-commission.dto';
import { WithdrawProfitDto } from './dto/withdraw-profit.dto';
import { getSolPrice } from '../../shared/get-sol-price.shared';

@Injectable()
export class TransactionsService {
  private withdrawBlacklist = process.env.WITHDRAW_BLACKLIST
    ? JSON.parse(process.env.WITHDRAW_BLACKLIST)
    : [];
  private withdrawFeePer = +(process.env.WITHDRAW_FEE_PERCENT ?? 0);
  private solrInSolEx = +(process.env.SOLR_IN_SOL_EX ?? 1000);

  constructor(
    @InjectRepository(Transactions)
    private transactionsRepo: Repository<Transactions>,
    @Inject(ERmqQueueName.TRANSFER) private transferRmqClient: ClientProxy
  ) {}

  async findAll(query: FetchTransDto) {
    const {
      limit = 10,
      page = 1,
      keyword = '',
      searchBy = ['telegramUserId'],
      isGetAll = false,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = query;

    const [data, total] = await this.transactionsRepo.findAndCount({
      where: [
        ...(keyword
          ? searchBy.map((item) => {
              return {
                [item]: keyword
              };
            })
          : [{}])
      ],
      order: { [sortBy]: sortOrder },
      ...(isGetAll ? {} : { take: limit, skip: (page - 1) * limit })
    });

    return {
      data,
      total
    };
  }

  async getAmountByAddress(
    address: string,
    options: FindConditions<Transactions> = {}
  ) {
    const usdtTransactions = await this.transactionsRepo.find({
      where: { walletAddress: address, coin: Coin.SOL, ...options },
      order: { createdAt: 'DESC' }
    });

    const solrTransactions = await this.transactionsRepo.find({
      where: { walletAddress: address, coin: Coin.SOLR, ...options },
      order: { createdAt: 'DESC' }
    });

    return {
      usdt:
        usdtTransactions.length > 0 ? Number(usdtTransactions[0].amount) : 0,
      solr: solrTransactions.length > 0 ? Number(solrTransactions[0].amount) : 0
    };
  }

  async getBalance(userId: number) {
    const solTransactions = await this.transactionsRepo.find({
      where: { userId, coin: Coin.SOL },
      order: { createdAt: 'DESC' }
    });

    const solrTransactions = await this.transactionsRepo.find({
      where: { userId, coin: Coin.SOLR },
      order: { createdAt: 'DESC' }
    });

    const solBalance = solTransactions.length
      ? Number(solTransactions[0].balanceAfter)
      : 0;
    const solPrice = await getSolPrice();
    const solInUsdt = solBalance * solPrice;

    return {
      sol:
        solTransactions.length > 0
          ? Number(solTransactions[0].balanceAfter)
          : 0,
      solr:
        solrTransactions.length > 0
          ? Number(solrTransactions[0].balanceAfter)
          : 0,
      solInUsdt: solInUsdt
    };
  }

  async updateFund(dto: UpdateFundDto, userId: number) {
    try {
      const uniqueTrans = await this.transactionsRepo.findOne({
        where: { comment: dto.comment + '-' + dto.uuid }
      });
      console.log('uniqueTrans', uniqueTrans);
      if (uniqueTrans) {
        throw new HttpException('Already exist trans', HttpStatus.BAD_REQUEST);
      }

      if (dto.coin === Coin.SOL) {
        const gFarmTransactions = await this.transactionsRepo.find({
          where: { userId, coin: Coin.SOL },
          order: { createdAt: 'DESC' }
        });
        const lastBalanceTonCat = gFarmTransactions[0]
          ? gFarmTransactions[0].balanceAfter
          : 0;
        if (
          lastBalanceTonCat < dto.amount &&
          dto.operation === FundOperation.SUB
        ) {
          throw new HttpException('Amount invalid', HttpStatus.BAD_REQUEST);
        }
        const newBalanceG =
          dto.operation === FundOperation.ADD
            ? Number(lastBalanceTonCat) + dto.amount
            : Number(lastBalanceTonCat) - dto.amount;

        const gFund = {
          comment: dto.comment + '-' + dto.uuid,
          amount: dto.amount,
          balanceBefore: lastBalanceTonCat,
          balanceAfter: newBalanceG,
          coin: Coin.SOL,
          status: TransactionStatus.SUCCESS,
          transactionType: dto.transactionType,
          userId,
          transactionHash: dto.transactionHash,
          rewardUserId: dto.rewardUserId,
          rewardType: dto.rewardType,
          walletAddress: dto.walletAddress
        };
        const transaction = await this.transactionsRepo.create(gFund);
        await this.transactionsRepo.save(transaction);
        return transaction;
      }

      if (dto.coin === Coin.SOLR) {
        const gFarmTransactions = await this.transactionsRepo.find({
          where: { userId, coin: Coin.SOLR },
          order: { createdAt: 'DESC' }
        });
        const lastBalanceTonCat = gFarmTransactions[0]
          ? gFarmTransactions[0].balanceAfter
          : 0;
        if (
          lastBalanceTonCat < dto.amount &&
          dto.operation === FundOperation.SUB
        ) {
          throw new HttpException('Amount invalid', HttpStatus.BAD_REQUEST);
        }
        const newBalanceG =
          dto.operation === FundOperation.ADD
            ? Number(lastBalanceTonCat) + dto.amount
            : Number(lastBalanceTonCat) - dto.amount;

        const gFund = {
          comment: dto.comment + '-' + dto.uuid,
          amount: dto.amount,
          balanceBefore: lastBalanceTonCat,
          balanceAfter: newBalanceG,
          coin: Coin.SOLR,
          status: TransactionStatus.SUCCESS,
          transactionType: dto.transactionType,
          userId,
          transactionHash: dto.transactionHash,
          rewardUserId: dto?.rewardUserId,
          rewardType: dto?.rewardType,
          walletAddress: dto.walletAddress
        };
        const transaction = await this.transactionsRepo.create(gFund);
        await this.transactionsRepo.save(transaction);
        return transaction;
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async validateWithdraw(currentUser: User, dto: any, isFake = false) {
    const { signature } = dto;
    // Get admin sol balancez
    const totalPool = await getSOLRBalance(process.env.ADMIN_PRIVATE_KEY);
    if (+totalPool < +dto.amount) {
      throw new HttpException(
        'Pool has insufficient balance',
        HttpStatus.BAD_REQUEST
      );
    }

    const feeWithdraw = Number((dto.amount * this.withdrawFeePer).toFixed(6));
    const amountWithdraw = Number(dto.amount - feeWithdraw);
    const walletAddress = currentUser.walletAddress;

    if (this.withdrawBlacklist.includes(walletAddress)) {
      throw new HttpException(
        "Your address can't withdraw.",
        HttpStatus.BAD_REQUEST
      );
    }

    const uniqueTrans = await this.transactionsRepo.findOne({
      where: { comment: 'Claim reward' + '-' + dto.uuid }
    });

    // Create withdraw transaction
    if (uniqueTrans) {
      throw new HttpException('Already exist trans', HttpStatus.BAD_REQUEST);
    }

    if (!isFake) {
      // Verify signature
      const verifySig = `Welcome to Solorium!\nClick to sign in and accept withdraw Solorium.\nWallet address: ${walletAddress}\nUUID: ${dto.uuid}\nAmount: ${dto.amount}`;

      const isSigValid = nacl.sign.detached.verify(
        decodeUTF8(verifySig),
        Uint8Array.from(bs58.decode(signature)),
        new PublicKey(walletAddress).toBytes()
      );

      if (!isSigValid) {
        throw new HttpException('Signature invalid', HttpStatus.BAD_REQUEST);
      }
    }

    return { walletAddress, feeWithdraw, amountWithdraw };
  }

  async withdrawnProfit(
    currentUser: User,
    dto: WithdrawProfitDto,
    isFake = false
  ) {
    try {
      const userId = currentUser.id;

      // Validatre withdraw profit
      const { walletAddress, feeWithdraw, amountWithdraw } =
        await this.validateWithdraw(currentUser, dto, isFake);

      // const rewardUser = await this.rewardUserRepo.findOne({
      //   where: { id: dto.rewardUserId, userId }
      // });
      const rewardUser = [];

      if (!rewardUser) {
        throw new HttpException(
          'Reward user is not found',
          HttpStatus.BAD_REQUEST
        );
      }

      // const reward = await this.rewardRepo.findOne({
      //   id: rewardUser.rewardId
      // });
      const reward = [];

      if (!reward) {
        throw new HttpException(
          'Package user is not found',
          HttpStatus.BAD_REQUEST
        );
      }

      // if (Number(rewardUser.totalClaimable) < Number(dto.amount)) {
      //   throw new HttpException('Amount invalid', HttpStatus.BAD_REQUEST);
      // }
      // const newBalanceG =
      //   Number(rewardUser.totalClaimable) - Number(dto.amount);

      // await this.rewardUserRepo.update(rewardUser.id, {
      //   totalClaimable: newBalanceG
      // });

      const gFarmTransaction = await this.transactionsRepo.findOne({
        where: {
          userId,
          coin: Coin.SOLR
        },
        order: { createdAt: 'DESC' }
      });

      const lastBalanceTonCat = +(gFarmTransaction?.balanceAfter ?? 0);

      // const gFund = {
      //   comment: `Claim profit ${dto.amount} SOLR
      //   } with ${feeWithdraw} SOLR Fee - TotalClaimable: ${Number(
      //     rewardUser.totalClaimable
      //   )} - ${dto.uuid}`,
      //   amount: +dto.amount,
      //   balanceBefore: lastBalanceTonCat,
      //   balanceAfter: lastBalanceTonCat - Number(dto.amount),
      //   coin: Coin.SOLR,
      //   status: TransactionStatus.SUCCESS,
      //   transactionType: TransactionType.WITHDRAW_PROFIT,
      //   walletAddress,
      //   userId,
      //   rewardUserId: dto.rewardUserId,
      //   rewardType: reward.name
      // };

      // const transaction = await this.transactionsRepo.create(gFund);

      // await this.transactionsRepo.save(transaction);

      const dataWithdraw = await this.transactionsRepo.find({
        transactionType: TransactionType.WITHDRAW_PROFIT
      });

      const totalAmount = dataWithdraw.reduce(
        (sum, deposit: any) => sum + parseFloat(deposit.amount),
        0
      );

      // await this.transferRmqClient.emit('withdraw', {
      //   toAddress: walletAddress,
      //   amountWithdraw,
      //   uuid: dto.uuid,
      //   totalAmount,
      //   amountFee: feeWithdraw,
      //   transactionId: transaction.id,
      //   currentUser,
      //   amount: dto.amount,
      //   coin: Coin.SOLR,
      //   rewardUserId: dto.rewardUserId,
      //   rewardType: reward.name,
      //   withdrawType: WithdrawType.PROFIT
      // });

      return {};
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async withdrawnCommission(
    currentUser: User,
    dto: WithdrawCommissionDto,
    isFake = false
  ) {
    try {
      const userId = currentUser.id;

      // Validatre withdraw profit
      const validateRes = await this.validateWithdraw(currentUser, dto, isFake);

      const gFarmTransaction = await this.transactionsRepo.findOne({
        where: {
          userId,
          coin: Coin.SOL
        },
        order: { createdAt: 'DESC' }
      });

      const lastBalanceTonCat = +(gFarmTransaction?.balanceAfter ?? 0);

      if (Number(lastBalanceTonCat) < Number(dto.amount)) {
        throw new HttpException('Amount invalid', HttpStatus.BAD_REQUEST);
      }

      validateRes.amountWithdraw *= this.solrInSolEx;
      validateRes.feeWithdraw *= this.solrInSolEx;
      const gFund = {
        comment: `Claim commission ${dto.amount} SOL (${
          dto.amount * this.solrInSolEx
        } SOLR) with ${validateRes.feeWithdraw} SOLR Fee - ${dto.uuid}`,
        amount: dto.amount,
        balanceBefore: lastBalanceTonCat,
        balanceAfter: lastBalanceTonCat - Number(dto.amount),
        coin: Coin.SOL,
        status: TransactionStatus.SUCCESS,
        transactionType: TransactionType.WITHDRAW,
        walletAddress: validateRes.walletAddress,
        userId
      };

      const transaction = await this.transactionsRepo.create(gFund);
      await this.transactionsRepo.save(transaction);

      const dataWithdraw = await this.transactionsRepo.find({
        transactionType: TransactionType.WITHDRAW
      });

      const totalAmount = dataWithdraw.reduce(
        (sum, deposit: any) => sum + parseFloat(deposit.amount),
        0
      );

      await this.transferRmqClient.emit('withdraw', {
        toAddress: validateRes.walletAddress,
        amountWithdraw: validateRes.amountWithdraw,
        uuid: dto.uuid,
        totalAmount,
        amountFee: validateRes.feeWithdraw,
        transactionId: transaction.id,
        currentUser,
        amount: dto.amount,
        coin: Coin.SOL,
        withdrawType: WithdrawType.COMMISSION
      });

      return transaction;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
