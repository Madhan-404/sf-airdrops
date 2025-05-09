import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AirdropItem } from "@/types/airdrop";
import { formatNumber } from "@/lib/utils";

interface AirdropCardProps {
  airdrop: AirdropItem;
}

export function AirdropCard({ airdrop }: AirdropCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {airdrop.mint.slice(0, 8)}...{airdrop.mint.slice(-8)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Chain</span>
            <span className="font-medium">{airdrop.chain}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Claimable Value</span>
            <span className="font-medium">{formatNumber(airdrop.claimableValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Unlocked</span>
            <span className="font-medium">{formatNumber(airdrop.amountUnlocked)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Locked</span>
            <span className="font-medium">{formatNumber(airdrop.amountLocked)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Claimed</span>
            <span className="font-medium">{formatNumber(airdrop.amountClaimed)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
