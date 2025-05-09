import { AirdropResponse } from "@/types/airdrop";
import { useNetworkState } from "@/hooks/useNetworkState";

export function useAirdropApi() {
  const { network } = useNetworkState();

  const BASE_URL =
    network === "devnet"
      ? "https://staging-api.streamflow.finance/v2/api"
      : "https://api.streamflow.finance/v2/api";

  const getClaimableAirdrops = async (address: string): Promise<AirdropResponse> => {
    const response = await fetch(
      `${BASE_URL}/airdrops/claimable/${address}/?limit=100&skimZeroValued=false`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch airdrops");
    }

    return response.json();
  };

  return { getClaimableAirdrops };
}
