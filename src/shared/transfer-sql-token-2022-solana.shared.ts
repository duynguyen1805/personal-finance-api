// Just to transfer funds (100 Tokens) from One account to another
import {
  ComputeBudgetProgram,
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedWithFeeInstruction,
  getAssociatedTokenAddressSync
} from '@solana/spl-token';

import { createMemoInstruction } from '@solana/spl-memo';

import bs58 from 'bs58';

// Initialize connection to local Solana node
const connection = new Connection(
  'https://api.mainnet-beta.solana.com',
  'confirmed'
);

// Define the extensions to be used by the mint

// Calculate the length of the mint

// Set the decimals, fee basis points, and maximum fee
const decimals = 6;
const feeBasisPoints = 0; // 1%
const maxFee = BigInt(1 * Math.pow(10, decimals)); // 9 tokens, max chargable fees

const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  units: 1000000
});

// set the desired priority fee
const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 10000
});

// Define the amount to be transferred, accounting for decimals

// Calculate the fee for the transfer

// Helper function to generate Explorer URL
function generateExplorerTxUrl(txId: string) {
  return `https://solscan.io/tx/${txId}?cluster=devnet`;
}
async function sendAndConfirm(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: PublicKey,
  confirmOptions?: ConfirmOptions,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
) {
  const associatedToken = getAssociatedTokenAddressSync(
    mint,
    owner,
    false,
    programId,
    associatedTokenProgramId
  );

  const transaction = new Transaction()
    .add(modifyComputeUnits)
    .add(addPriorityFee)
    .add(
      createAssociatedTokenAccountIdempotentInstruction(
        payer.publicKey,
        associatedToken,
        owner,
        mint,
        programId,
        associatedTokenProgramId
      )
    );
  try {
    await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      confirmOptions
    );
  } catch (err) {
    console.log('err', err);
  }

  return associatedToken;
}

export async function withdraw(
  addressReceived: string,
  amount: number,
  massageMemo: string
) {
  const payer = Keypair.fromSecretKey(
    Uint8Array.from(bs58.decode(process.env.ADMIN_PRIVATE_KEY))
  );
  const owner = Keypair.fromSecretKey(
    Uint8Array.from(bs58.decode(process.env.ADMIN_PRIVATE_KEY))
  );
  // address token transfer
  const mintToken = new PublicKey(process.env.POS_WALLET_ADDRESS);
  // get from solscan - dont change
  const sourceAccount = new PublicKey(
    process.env.TRANSFER_CHECK_SOURCE_ADDRESS
  );
  // address recived
  const destinationOwner = new PublicKey(addressReceived);

  const destinationAccount = await sendAndConfirm(
    connection,
    payer,
    mintToken,
    destinationOwner,
    {},
    TOKEN_2022_PROGRAM_ID
  );

  try {
    const transferAmount = BigInt(amount * Math.pow(10, decimals)); // Transfer 1000 tokens
    const calcFee = (transferAmount * BigInt(feeBasisPoints)) / BigInt(10000); // expect 50 fee
    const fee = calcFee > maxFee ? maxFee : calcFee;
    const memo = createMemoInstruction(massageMemo);

    const transaction = new Transaction()
      .add(modifyComputeUnits)
      .add(addPriorityFee)
      .add(
        memo,
        createTransferCheckedWithFeeInstruction(
          sourceAccount,
          mintToken,
          destinationAccount,
          owner.publicKey,
          transferAmount,
          decimals,
          fee,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

    const sig = await sendAndConfirmTransaction(connection, transaction, [
      payer,
      owner
    ]);
    await generateExplorerTxUrl(sig);
    return { digest: sig };
  } catch (error) {
    console.log('error minting and/or transferring token: ', error);
    if (error?.signature) {
      return { digest: error.signature };
    }
  }

  return null;
}
