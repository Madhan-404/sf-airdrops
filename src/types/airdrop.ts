export interface AirdropItem {
  chain: string;
  distributorAddress: string;
  address: string;
  amountUnlocked: string;
  amountLocked: string;
  amountClaimed: string;
  mint: string;
  claimableValue: string;
}

export interface AirdropResponse {
  limit: number;
  offset: number;
  items: AirdropItem[];
}
