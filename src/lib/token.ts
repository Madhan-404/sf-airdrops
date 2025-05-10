import axios from 'axios';

// Cache implementation for token data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const nameCache = new Map<string, CacheEntry<string>>();
const priceCache = new Map<string, CacheEntry<number>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Debounce implementation
const debounce = <T extends (...args: Parameters<T>) => Promise<unknown>>(func: T, wait: number): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(func(...args)), wait);
    });
  }) as T;
};

export const getTokenName = async (mintAddress: string): Promise<string | null> => {
  // Check cache first
  const cached = nameCache.get(mintAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

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
    const tokenName = result?.token_info?.symbol || null;
    
    // Update cache
    if (tokenName) {
      nameCache.set(mintAddress, { data: tokenName, timestamp: Date.now() });
    }

    return tokenName;
  } catch (error) {
    console.error('Error fetching token name:', error);
    return null;
  }
};

// Debounced version of getTokenPrice
export const getTokenPrice = debounce(async (mintAddress: string): Promise<number | null> => {
  // Check cache first
  const cached = priceCache.get(mintAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mintAddress}&vs_currencies=usd`
    );
    const price = response.data[mintAddress.toLowerCase()]?.usd || null;
    
    // Update cache
    if (price !== null) {
      priceCache.set(mintAddress, { data: price, timestamp: Date.now() });
    }

    return price;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
}, 500); // 500ms debounce 