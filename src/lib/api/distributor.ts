import { useNetworkState } from "@/hooks/useNetworkState";
import { DistributorResponse } from "@/types/distributor";

// Cache implementation
const cache = new Map<string, { data: DistributorResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useDistributorApi() {
  const { network } = useNetworkState();

  const BASE_URL =
    network === "devnet"
      ? "https://staging-api.streamflow.finance/v2/api"
      : "https://api-public.streamflow.finance/v2/api";

  const getDistributorInfo = async (address: string): Promise<DistributorResponse> => {
    // Check cache first
    const cached = cache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const response = await fetch(`${BASE_URL}/airdrops/${address}`);

    if (!response.ok) {
      throw new Error("Failed to fetch distributor info");
    }

    const data = await response.json();

    // Update cache
    cache.set(address, { data, timestamp: Date.now() });

    return data;
  };

  return { getDistributorInfo };
}
