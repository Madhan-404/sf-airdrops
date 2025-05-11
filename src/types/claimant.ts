export interface ClaimantResponse {
  chain: string;
  proof: number[][];
  amountClaimed: string;
  distributorAddress: string;
  amountUnlocked: string;
  address: string;
  amountLocked: string;
}
