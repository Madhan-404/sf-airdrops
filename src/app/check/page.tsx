"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { AirdropCard } from "@/components/AirdropCard";
import { useAirdropApi } from "@/lib/api/airdrop";
import { AirdropItem } from "@/types/airdrop";
import { Loading } from "@/components/ui/loading";

export default function CheckPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { getClaimableAirdrops } = useAirdropApi();
  const [airdrops, setAirdrops] = useState<AirdropItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      router.push(`/check/${publicKey.toString()}`);
    }
  }, [connected, publicKey, router]);

  useEffect(() => {
    if (!publicKey) return;

    getClaimableAirdrops(publicKey.toString())
      .then((response) => {
        setAirdrops(response.items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [publicKey, getClaimableAirdrops]);

  if (!connected) {
    return (
      <div className="container py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Check Eligibility</CardTitle>
            <CardDescription>
              Connect your wallet to check if you&apos;re eligible for StreamFlow airdrops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  Connect your wallet to check your eligibility status
                </p>
              </div>
              <WalletMultiButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Your Airdrops</CardTitle>
          <CardDescription>View all your claimable airdrops</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : airdrops.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No airdrops found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {airdrops.map((airdrop, index) => (
                <AirdropCard key={`${airdrop.mint}-${index}`} airdrop={airdrop} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
