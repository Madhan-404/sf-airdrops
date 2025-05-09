"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

// Custom styles for the wallet modal
const walletModalStyles = {
  "--wallet-modal-background": "#000000",
  "--wallet-modal-border": "rgba(255, 255, 255, 0.1)",
  "--wallet-modal-text": "#ffffff",
  "--wallet-modal-hover": "rgba(59, 130, 246, 0.1)",
  "--wallet-modal-button-background": "var(--primary)",
  "--wallet-modal-button-text": "var(--primary-foreground)",
  "--wallet-modal-button-hover": "var(--primary-hover)",
} as React.CSSProperties;

export default function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      toast.success(`Connected to ${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`);
    }
  }, [connected, publicKey]);

  if (!mounted) return null;

  return (
    <div className="wallet-adapter-button-trigger" style={walletModalStyles}>
      <WalletMultiButton
        className={cn(
          "wallet-adapter-button",
          "bg-gradient-to-r from-primary to-primary/90",
          "text-primary-foreground hover:from-primary/90 hover:to-primary",
          "h-10 px-6 rounded-lg text-sm font-semibold",
          "inline-flex items-center justify-center gap-2",
          "transition-all duration-300 ease-in-out",
          "shadow-md hover:shadow-lg",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "active:scale-[0.98]",
        )}
      />
    </div>
  );
}
