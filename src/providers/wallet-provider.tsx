"use client";

import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Cluster } from "@solana/web3.js";
import { useMemo } from "react";
import { useNetworkState } from "../hooks/useNetworkState";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

// Import Solana wallet styles
import "@solana/wallet-adapter-react-ui/styles.css";
import "@/styles/wallet.css";

const networkToCluster: Record<WalletAdapterNetwork, Cluster> = {
  [WalletAdapterNetwork.Mainnet]: "mainnet-beta",
  [WalletAdapterNetwork.Devnet]: "devnet",
  [WalletAdapterNetwork.Testnet]: "testnet",
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { network } = useNetworkState();
  const endpoint = useMemo(() => clusterApiUrl(networkToCluster[network]), [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
