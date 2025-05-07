import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

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
            <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90">
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
