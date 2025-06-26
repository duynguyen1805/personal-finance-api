import { TokenAddress } from '../modules/transactions/dto/enum.dto';

const axios = require('axios');

export async function getSolPrice(tokenAddress = TokenAddress.SOL) {
  try {
    const response = await axios.get(
      `https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price/${tokenAddress}`,
      {
        headers: {
          Accept: '*/*'
        }
      }
    );
    return response.data.data.attributes.token_prices[tokenAddress];
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}
