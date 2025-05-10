import axios from 'axios';

interface JupiterTokenV1 {
  address: string;
  name: string;
  symbol: string;
}

const priceCache = new Map<string, { data: number; timestamp: number }>();
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

export async function getTokenName(mintAddress: string): Promise<string | null> {
  if (!mintAddress) return null;
  try {
    const response = await fetch(`https://lite-api.jup.ag/tokens/v1/token/${mintAddress}`);
    if (!response.ok) return null;
    const token: JupiterTokenV1 = await response.json();
    return token.symbol || null;
  } catch (error) {
    console.error("Error fetching token name:", error);
    return null;
  }
}

// Debounced version of getTokenPrice
export const getTokenPrice = debounce(async (mintAddress: string): Promise<number | null> => {
  if (!mintAddress) return null;

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
}, 200); 