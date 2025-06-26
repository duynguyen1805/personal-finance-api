import { Controller, Inject, Logger } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  Payload,
  RmqContext
} from '@nestjs/microservices';
import { RmqService } from '../../rmq/rmq.service';
import { TransactionsService } from '../transactions.service';
import { delay } from '../../../common/common.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactions } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
import {
  ERmqQueueName,
  FundOperation,
  TransactionStatus,
  TransactionType,
  WithdrawType
} from '../dto/enum.dto';
import { withdrawMessage } from '../../../shared/create-message-withdraw.shared';
// import { transferSolr } from '../../../shared/send-solr.shared';
import { uuid } from 'uuidv4';

@Controller()
export class TransactionConsumer {
  private readonly logger = new Logger(TransactionConsumer.name);
  private withdrawFeePer = +(process.env.WITHDRAW_FEE_PERCENT ?? 0);

  constructor(
    @Inject(TransactionsService)
    private transactionService: TransactionsService,
    @Inject(RmqService) private rmqService: RmqService,
    @Inject(ERmqQueueName.TRANSFER_FEE)
    private transferFeeRmqClient: ClientProxy,
    @InjectRepository(Transactions)
    private transactionsRepo: Repository<Transactions>,
  ) {}

  @EventPattern('updateFund')
  async sendUpdateFund(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug('Start add fund');
    try {
      await this.transactionService.updateFund(data.dto, data.userId);
    } catch (e: any) {
      this.logger.debug(e);
    }

    this.logger.debug('add fund completed');
  }

  @EventPattern('transferWithdrawFee')
  async transferWithdrawFee(
    @Payload() msgData: any,
    @Ctx() context: RmqContext
  ) {
    this.rmqService.ack(context);

    try {
      const {
        amountFee,
        coin,
        userId,
        rewardUserId,
        rewardType,
        toAddress,
        transactionId
      } = msgData;

      // Transfer fee to address Received Fee
      await delay(30000);

      // const digest: any = await transferSolr(
      //   process.env.RECEIVED_TRANSFER_FEE_ADDRESS,
      //   +amountFee
      // );
      const digest: any = null;

      if (digest) {
        const nUUID = uuid();
        await this.transactionService.updateFund(
          {
            amount: amountFee,
            coin,
            comment: `Fee withdraw (#${transactionId}) - ${nUUID}`,
            uuid: nUUID,
            operation: FundOperation.ADD,
            transactionType: TransactionType.WITHDRAW_FEE,
            transactionHash: digest,
            rewardUserId,
            rewardType,
            walletAddress: toAddress
          },
          userId
        );
      }
    } catch (e: any) {
      this.logger.error(`TransferWithdrawFee Error: ${e}`);
    }
  }

  @EventPattern('withdraw')
  async withdraw(@Payload() msgData: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    const {
      toAddress,
      amountWithdraw,
      totalAmount,
      amountFee,
      transactionId,
      currentUser,
      amount,
      coin,
      rewardUserId,
      rewardType,
      withdrawType
    } = msgData;
    try {
      // withdraw
      // const digest: any = await transferSolr(toAddress, amountWithdraw);
      const digest: any = null;
      if (digest) {
        // Update transaction hash
        await this.transactionsRepo.update(transactionId, {
          transactionHash: digest,
          status: TransactionStatus.SUCCESS
        });

        // Log withdraw to telegram group
        await withdrawMessage(toAddress, amountWithdraw, totalAmount, digest);

        if (this.withdrawFeePer > 0) {
          await this.transferFeeRmqClient.emit('transferWithdrawFee', {
            amountFee,
            coin,
            userId: currentUser.id,
            rewardUserId,
            rewardType,
            transactionId
          });
        }
      } else {
        if (transactionId) {
          await this.transactionsRepo.update(transactionId, {
            status: TransactionStatus.FAILED
          });

          // if (withdrawType === WithdrawType.PROFIT) {
          //   await this.rewardUserRepo
          //     .createQueryBuilder()
          //     .update(RewardUser)
          //     .set({
          //       totalClaimable: () => `"totalClaimable" + ${amount}`
          //     })
          //     .where('reward_user.id = :rewardUserId', {
          //       rewardUserId
          //     })
          //     .execute();
          // }

          const nUUID = uuid();
          await this.transactionService.updateFund(
            {
              amount,
              coin,
              comment: `Revert failed withdraw (#${transactionId}) - ${nUUID}`,
              uuid: nUUID,
              operation: FundOperation.ADD,
              transactionType:
                withdrawType === WithdrawType.PROFIT
                  ? TransactionType.WITHDRAW_PROFIT
                  : TransactionType.WITHDRAW,
              rewardUserId,
              rewardType,
              walletAddress: toAddress
            },
            currentUser.id
          );
        }
      }
    } catch (e: any) {
      this.logger.error(e);
    }
  }
}
