import axios from 'axios';

export const getTokenName = async (mintAddress: string): Promise<string | null> => {
  try {
    const url = `https://grateful-jerrie-fast-mainnet.helius-rpc.com`;

    const response = await axios.post(url, {
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAsset',
      params: {
        id: mintAddress,
        displayOptions: {
          showFungible: true,
        },
      },
    });

    const { result } = response.data;
    if (!result?.token_info?.symbol) {
      return null;
    }

    return result.token_info.symbol;
  } catch (error) {
    console.error('Error fetching token name:', error);
    return null;
  }
};

export const getTokenPrice = async (mintAddress: string): Promise<number | null> => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mintAddress}&vs_currencies=usd`
    );
    return response.data[mintAddress.toLowerCase()]?.usd || null;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
}; 