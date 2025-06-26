// import { Connection, Keypair, PublicKey } from '@solana/web3.js';
// import bs58 from 'bs58';

// const connection = new Connection(process.env.SOLANA_HTTP_PROVIDER);

// export const getSOLRBalance = async (privateKey: any) => {
//   const adminWallet = Keypair.fromSecretKey(
//     Uint8Array.from(bs58.decode(privateKey))
//   );

//   const mint = new PublicKey(process.env.SOLR_TOKEN_ADDRESS);

//   const tokenBalance = await connection.getParsedTokenAccountsByOwner(
//     adminWallet.publicKey,
//     { mint: mint }
//   );

//   return +(
//     tokenBalance?.value[0]?.account?.data?.parsed?.info?.tokenAmount
//       ?.uiAmount ?? 0
//   );
// };
