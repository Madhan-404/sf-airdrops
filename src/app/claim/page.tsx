import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WalletButton from "@/components/WalletButton";

export default function ClaimPage() {
  return (
    <div className="container py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Claim Your Airdrop</CardTitle>
          <CardDescription>
            Connect your wallet to view and claim your available airdrops
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Connect your wallet to view your available claims
              </p>
            </div>
            <WalletButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
