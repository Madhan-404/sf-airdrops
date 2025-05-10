import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AirdropItem } from "@/types/airdrop";
import { formatNumber } from "@/lib/utils";
import { getTokenName } from "@/lib/token";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNetworkState } from "@/hooks/useNetworkState";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

interface AirdropCardProps {
  airdrop: AirdropItem;
}

const BN_DIVISOR = 1000000; // For converting from BN to normal numbers

export function AirdropCard({ airdrop }: AirdropCardProps) {
  const router = useRouter();
  const { network } = useNetworkState();
  const [tokenName, setTokenName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert BN values to normal numbers
  const amountUnlocked = parseFloat(airdrop.amountUnlocked) / BN_DIVISOR;
  const amountLocked = parseFloat(airdrop.amountLocked) / BN_DIVISOR;
  const amountClaimed = parseFloat(airdrop.amountClaimed) / BN_DIVISOR;
  const claimableValue = parseFloat(airdrop.claimableValue);

  const totalUnlocked = amountUnlocked + amountLocked;
  const unlockedPercentage = (amountUnlocked / totalUnlocked) * 100;

  const hasClaimableValue = claimableValue > 0;
  const hasUnlockedValue = amountUnlocked > 0;
  const isDevnet = network === WalletAdapterNetwork.Devnet;

  // Memoize the fetch function
  const fetchTokenInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const name = await getTokenName(airdrop.mint);
      setTokenName(name);
    } catch (error) {
      console.error('Error fetching token name:', error);
    } finally {
      setIsLoading(false);
    }
  }, [airdrop.mint]);

  useEffect(() => {
    fetchTokenInfo();
  }, [fetchTokenInfo]);

  const handleCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(airdrop.distributorAddress);
    toast.success("Address copied to clipboard");
  }, [airdrop.distributorAddress]);

  const handleClaim = useCallback(() => {
    router.push(`/claim/${airdrop.distributorAddress}`);
  }, [router, airdrop.distributorAddress]);

  return (
    <Card 
      className={cn(
        "w-full transition-all duration-300 hover:shadow-lg",
        hasClaimableValue ? "border-green-500/50 hover:border-green-500" :
        hasUnlockedValue ? "border-yellow-500/50 hover:border-yellow-500" :
        "border-red-500/50 hover:border-red-500"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {isLoading ? "Loading..." : tokenName || airdrop.mint.slice(0, 8) + "..." + airdrop.mint.slice(-8)}
          </CardTitle>
          {hasClaimableValue && !isDevnet && (
            <span className="text-lg font-semibold text-green-500">
              ${formatNumber(claimableValue)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Unlocked Progress</span>
            <span className="font-medium">{formatNumber(unlockedPercentage)}%</span>
          </div>
          <Progress value={unlockedPercentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {formatNumber(amountUnlocked)} / {formatNumber(totalUnlocked)}
            </span>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount Claimed</span>
          <span className="font-medium">{formatNumber(amountClaimed)}</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <h3 className="text-foreground">DistributorAddress</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleCopyAddress}
          >
            <Copy className="h-4 w-4 mr-2" />
            {airdrop.distributorAddress.slice(0, 4)}...{airdrop.distributorAddress.slice(-4)}
          </Button>
          
          {(hasClaimableValue || hasUnlockedValue) && (
            <Button 
              onClick={handleClaim}
              className={cn(
                "bg-green-500 hover:bg-green-600",
                hasClaimableValue ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"
              )}
            >
              Claim
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
