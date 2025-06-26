import * as emoji from 'node-emoji';
// import { getSOLRBalance } from './get-solr-balance';
import { formatAmountBuy } from './format-amount-buy.shared';
import { sendMessageTelegram } from './send-message-telegram.shared';
import { EMessageTypeEnum } from './enums/message-types.enum';
import { Coin } from '../modules/transactions/dto/enum.dto';

export async function withdrawMessage(
  address: string,
  amount: number,
  totalWithdraw: number,
  transactionHash: string
) {
  // const totalPool = await getSOLRBalance(process.env.ADMIN_PRIVATE_KEY);
  const totalPool = 0;

  const CHAT_ID_PRODUCTION_NORMAL = +process.env.CHAT_ID_PRODUCTION_NORMAL;

  const textMessageEn = `${emoji.get('bell')} <b>SOLR Alert </b> ${emoji.get(
    'bell'
  )}

🏠Address: https://solscan.io/account/${address}

💵Amount Withdraw: ${formatAmountBuy(amount)} SOLR 

💵Total Withdraw: ${formatAmountBuy(totalWithdraw)} SOLR 

💵Total Current Pool: ${formatAmountBuy(totalPool)} SOLR 

🔗TxHash: https://solscan.io/tx/${transactionHash}`;

  const textMessageVi = `${emoji.get('bell')} <b>Thông báo rút SOLR</b> ${emoji.get(
  'bell'
  )}

🏠Ví: https://solscan.io/account/${address}

💵Số lượng rút: ${formatAmountBuy(amount)} SOLR

💵Tổng số đã rút: ${formatAmountBuy(totalWithdraw)} SOLR

💵Tổng số còn lại trong pool: ${formatAmountBuy(totalPool)} SOLR

🔗TxHash: https://solscan.io/tx/${transactionHash}`;

  await sendMessageTelegram(
    EMessageTypeEnum.TEXT,
    CHAT_ID_PRODUCTION_NORMAL,
    textMessageVi,
    'https://res.cloudinary.com/nfttokenasa/video/upload/v1723436638/o4jzneiyddgpgs9zz7ul.mp4'
  );
}

export async function packagePurchaseMessage(
  address: string,
  packageName: string,
  quantity: number,
  totalAmountSol: number,
  totalAmountUsdt: number,
  solPrice: number,
  transactionHash: string,
  totalInvestmentSol: number,
  totalInvestmentUsdt: number
) {
  const CHAT_ID_PRODUCTION_NORMAL = +process.env.CHAT_ID_PRODUCTION_NORMAL;

  const textMessage = `${emoji.get(
    'bell'
  )} <b>Thông báo mua gói</b> ${emoji.get('bell')}

🏠Ví: https://solscan.io/account/${address}

📦Gói: ${packageName}

🔢Số lượng: ${quantity}

💵Đã thanh toán: ${formatAmountBuy(totalAmountSol)} SOL ($${formatAmountBuy(
    totalAmountUsdt
  )})

💱Tỉ giá: 1 SOL = $${formatAmountBuy(solPrice)}

📊Tổng số SOL đã đầu tư: ${formatAmountBuy(totalInvestmentSol)} SOL ($${formatAmountBuy(totalInvestmentUsdt)})

🔗TxHash: https://solscan.io/tx/${transactionHash}`;

  await sendMessageTelegram(
    EMessageTypeEnum.TEXT,
    CHAT_ID_PRODUCTION_NORMAL,
    textMessage,
    'https://res.cloudinary.com/nfttokenasa/video/upload/v1723436638/o4jzneiyddgpgs9zz7ul.mp4'
  );
}
