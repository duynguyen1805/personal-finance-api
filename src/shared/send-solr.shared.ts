import bs58 from 'bs58';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount
} from '@solana/spl-token';

// Keys from .env
const secretKey = process.env.ADMIN_PRIVATE_KEY;

const fromWallet = Keypair.fromSecretKey(bs58.decode(secretKey));

// Token Mint Account Address
const mint = new PublicKey(process.env.SOLR_TOKEN_ADDRESS);

// export const transferSolr = async (publicKey, amount) => {
//   try {
//     const connection = new Connection(process.env.SOLANA_HTTP_PROVIDER);

//     // Get or create the fromTokenAccount
//     const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
//       connection,
//       fromWallet,
//       mint,
//       fromWallet.publicKey
//     );

//     // Get or create the toTokenAccount
//     const toTokenAccount = await getOrCreateAssociatedTokenAccount(
//       connection,
//       fromWallet,
//       mint,
//       new PublicKey(publicKey)
//     );

//     console.log('From Token Account:', fromTokenAccount.address.toString());
//     console.log('To Token Account:', toTokenAccount.address.toString());

//     // Add token transfer instructions to transaction
//     const transaction = new Transaction().add(
//       createTransferInstruction(
//         fromTokenAccount.address,
//         toTokenAccount.address,
//         fromWallet.publicKey,
//         +amount.toFixed(6) * 10 ** 9 // Adjust the amount based on token decimals
//       )
//     );
//     // Sign transaction, broadcast, and confirm
//     const transactionSignature = await sendAndConfirmTransaction(
//       connection,
//       transaction,
//       [fromWallet]
//     );

//     console.log(`Transaction successful! Signature: ${transactionSignature}`);
//     console.log(`Explorer: https://solscan.io/tx/${transactionSignature}`);
//     return transactionSignature;
//   } catch (error) {
//     console.log(
//       `Transaction Thành công nhưng báo faile! Signature: ${error.signature}`
//     );
//     console.log(`Explorer: https://solscan.io/tx/${error.signature}`);
//     console.log('error', error);
//     return error?.signature;
//   }
// };
