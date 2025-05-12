import { ICluster, ITransactionResult } from "@streamflow/common";
import { IInteractSolanaExt, SolanaDistributorClient } from "@streamflow/distributor/solana";
import { WalletAdapterNetwork, SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { ClaimantResponse } from "../../types/claimant";
import BN from "bn.js";
import { IClaimData } from "@streamflow/distributor/solana";
import { useNetworkState } from "../../hooks/useNetworkState";

// Initialize Streamflow client based on network
const getClient = (network: WalletAdapterNetwork) => {
  const mainnetApiKey = process.env.NEXT_PUBLIC_HELIUS_MAINNET_API_KEY;
  const devnetApiKey = process.env.NEXT_PUBLIC_HELIUS_DEVNET_API_KEY;

  if (!mainnetApiKey || !devnetApiKey) {
    throw new Error("Helius API keys are not configured in environment variables");
  }

  const clusterUrl =
    network === WalletAdapterNetwork.Mainnet
      ? `https://mainnet.helius-rpc.com/?api-key=${mainnetApiKey}`
      : `https://devnet.helius-rpc.com/?api-key=${devnetApiKey}`;
  const cluster = network === WalletAdapterNetwork.Mainnet ? ICluster.Mainnet : ICluster.Devnet;

  return new SolanaDistributorClient({
    clusterUrl,
    cluster,
  });
};

export const client = getClient(useNetworkState.getState().network);

export const createClaimParams = (claimantData: ClaimantResponse): IClaimData => {
  // Validate claimantData
  if (!claimantData.distributorAddress) {
    throw new Error("Invalid claimant data: distributorAddress is missing");
  }
  if (!claimantData.proof || !Array.isArray(claimantData.proof)) {
    throw new Error("Invalid claimant data: proof is missing or invalid");
  }
  if (!claimantData.amountUnlocked || !claimantData.amountLocked) {
    throw new Error("Invalid claimant data: amountUnlocked or amountLocked is missing");
  }

  return {
    id: claimantData.distributorAddress,
    proof: claimantData.proof,
    amountUnlocked: new BN(claimantData.amountUnlocked),
    amountLocked: new BN(claimantData.amountLocked),
  };
};

export const claimAirdrop = async (
  claimantData: ClaimantResponse,
  walletAdapter: SignerWalletAdapter,
): Promise<ITransactionResult> => {
  if (!walletAdapter.publicKey) {
    throw new Error("Wallet not connected");
  }

  const network = useNetworkState.getState().network;
  console.log("Current Network:", network);

  // Get a fresh client instance with current network
  const client = getClient(network);
  console.log(
    "Using RPC:",
    network === WalletAdapterNetwork.Mainnet ? "mainnet.helius-rpc.com" : "devnet.helius-rpc.com",
  );
  console.log("Distributor Address:", claimantData.distributorAddress);
  console.log("Wallet Public Key:", walletAdapter.publicKey.toString());

  const claimParams = createClaimParams(claimantData);
  const solanaParams: IInteractSolanaExt = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invoker: walletAdapter as any, // Type assertion to bypass dependency mismatch between @solana/web3.js versions
  };

  console.log("Claim params:", claimParams);
  console.log("Solana params:", { invoker: walletAdapter.publicKey.toBase58() });

  try {
    const result = await client.claim(claimParams, solanaParams);
    if (!result.ixs || !result.txId) {
      throw new Error("Invalid transaction result from client.claim");
    }
    console.log("Claim result:", {
      txId: result.txId,
      ixs: result.ixs.map((i) => ({
        programId: i.programId.toBase58(),
        keys: i.keys.map((k) => ({
          pubkey: k.pubkey.toBase58(),
          isSigner: k.isSigner,
          isWritable: k.isWritable,
        })),
        data: i.data.toString("hex"),
      })),
    });
    return result as ITransactionResult;
  } catch (error: unknown) {
    console.error("Claim airdrop failed:", error);
    // Add more detailed error information
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    throw new Error(
      `Claim airdrop failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
