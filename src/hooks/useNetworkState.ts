import { create } from "zustand";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

interface NetworkState {
  network: WalletAdapterNetwork;
  setNetwork: (network: WalletAdapterNetwork) => void;
}

export const useNetworkState = create<NetworkState>((set) => ({
  network: WalletAdapterNetwork.Mainnet,
  setNetwork: (network) => set({ network }),
}));
