export interface DistributorResponse {
    chain: string;
    mint: string;
    version: number;
    address: string;
    sender: string;
    name: string;
    maxNumNodes: string;
    maxTotalClaim: string;
    totalAmountUnlocked: string;
    totalAmountLocked: string;
    isActive: boolean;
    isOnChain: boolean;
    isVerified: boolean;
    clawbackDt: string | null;
    isAligned: boolean;
    merkleRoot: number[];
  }