import axios from "axios";
import { ClaimantResponse } from "@/types/claimant";
import { useNetworkState } from "@/hooks/useNetworkState";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const BASE_URLS = {
  [WalletAdapterNetwork.Mainnet]: "https://api-public.streamflow.finance",
  [WalletAdapterNetwork.Devnet]: "https://staging-api.streamflow.finance",
};

// Cache implementation
interface CacheEntry {
  data: ClaimantResponse;
  timestamp: number;
  network: string;
}

const claimantCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useClaimantApi = () => {
  const { network } = useNetworkState();

  const getClaimantInfo = async (
    distributorAddress: string,
    claimantAddress: string,
  ): Promise<ClaimantResponse | null> => {
    const cacheKey = `${distributorAddress}-${claimantAddress}-${network}`;

    // Check cache first
    const cached = claimantCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL && cached.network === network) {
      return cached.data;
    }

    try {
      const baseUrl = BASE_URLS[network as keyof typeof BASE_URLS];
      const response = await axios.get<ClaimantResponse>(
        `${baseUrl}/v2/api/airdrops/${distributorAddress}/claimants/${claimantAddress}`,
      );

      // Update cache
      claimantCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
        network,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        return null;
      }
      throw error;
    }
  };

  return { getClaimantInfo };
};
