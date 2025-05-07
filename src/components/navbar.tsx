"use client";

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import WalletButton from "@/components/WalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNetworkState } from "@/hooks/useNetworkState";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { network, setNetwork } = useNetworkState();
  const { connected, disconnect, publicKey } = useWallet();

  const handleNetworkChange = (newNetwork: WalletAdapterNetwork) => {
    setNetwork(newNetwork);
  };

  const handleDisconnect = () => {
    if (connected && publicKey) {
      console.log("Disconnecting wallet:", publicKey.toBase58());
      disconnect();
    }
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold hover:text-primary">
            Solana Airdrops
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/check" className="text-sm text-muted-foreground hover:text-primary">
              Check
            </Link>
            <Link href="/claim" className="text-sm text-muted-foreground hover:text-primary">
              Claim
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <WalletButton />
          <div className=" flex items-center space-x-4 px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {network === WalletAdapterNetwork.Mainnet ? "Mainnet" : "Devnet"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleNetworkChange(WalletAdapterNetwork.Mainnet)}>
                  Mainnet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNetworkChange(WalletAdapterNetwork.Devnet)}>
                  Devnet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ModeToggle />
          </div>

          {connected && (
            <Button variant="ghost" size="icon" onClick={handleDisconnect}>
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
