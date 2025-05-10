"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDistributorApi } from "@/lib/api/distributor";
import { getTokenName, getTokenPrice } from "@/lib/token";
import { formatNumber } from "@/lib/utils";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useNetworkState } from "@/hooks/useNetworkState";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DistributorResponse } from "@/types/distributor";

const BN_DIVISOR = 1000000;

export default function DistributorPage() {
  const params = useParams();
  const { network } = useNetworkState();
  const { getDistributorInfo } = useDistributorApi();
  const [distributor, setDistributor] = useState<DistributorResponse>();
  const [tokenName, setTokenName] = useState<string | null>(null);
  const [tokenPrice, setTokenPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the fetch functions to prevent unnecessary re-renders
  const fetchTokenInfo = useCallback(async (mint: string) => {
    try {
      const [name, price] = await Promise.all([
        getTokenName(mint) as Promise<string | null>,
        network === WalletAdapterNetwork.Mainnet ? getTokenPrice(mint) : Promise.resolve(null)
      ]);
      setTokenName(name);
      setTokenPrice(price as number | null);
    } catch (err) {
      console.error('Error fetching token info:', err);
    }
  }, [network]);

  useEffect(() => {
    if (!params.address) return;

    const fetchData = async () => {
      try {
        const data = await getDistributorInfo(params.address as string);
        setDistributor(data);
        await fetchTokenInfo(data.mint);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.address, getDistributorInfo, fetchTokenInfo]);

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }, []);

  if (loading) {
    return (
      <div className="container py-10">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="flex items-center justify-center py-20 text-red-500">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!distributor) return null;

  const totalUnlocked = parseFloat(distributor.totalAmountUnlocked) / BN_DIVISOR;
  const totalLocked = parseFloat(distributor.totalAmountLocked) / BN_DIVISOR;
  const maxTotal = parseFloat(distributor.maxTotalClaim) / BN_DIVISOR;
  const unlockedPercentage = (totalUnlocked / maxTotal) * 100;

  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary">{distributor.name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant={distributor.isVerified ? "success" : "destructive"}>
                {distributor.isVerified ? "Verified" : "Unverified"}
              </Badge>
              <Badge variant={distributor.isActive ? "success" : "destructive"}>
                {distributor.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant={distributor.isOnChain ? "success" : "destructive"}>
                {distributor.isOnChain ? "On Chain" : "Off Chain"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-bold text-primary">Token:</span>
            <span className="font-medium">{tokenName || distributor.mint.slice(0, 8) + "..." + distributor.mint.slice(-8)}</span>
            {tokenPrice !== null && (
              <span className="text-green-500 font-semibold ml-2">(${formatNumber(tokenPrice.toFixed(2))})</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-bold text-primary">Recipients:</span>
            <span className="font-medium">{formatNumber(parseInt(distributor.maxNumNodes))}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-primary">Unlocked Percentage</span>
              <span className="font-medium">{formatNumber(unlockedPercentage.toFixed(2))}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatNumber(totalUnlocked.toFixed(2))} / {formatNumber(maxTotal.toFixed(2))}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">Distributor Address</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(distributor.address, "Distributor address")}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {distributor.address.slice(0, 4)}...{distributor.address.slice(-4)}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">Sender Address</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(distributor.sender, "Sender address")}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {distributor.sender.slice(0, 4)}...{distributor.sender.slice(-4)}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">Total Unlocked</span>
                    <span className="font-medium">{formatNumber(totalUnlocked.toFixed(2))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">Total Locked</span>
                    <span className="font-medium">{formatNumber(totalLocked.toFixed(2))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">Max Total Claim</span>
                    <span className="font-medium">{formatNumber(maxTotal.toFixed(2))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 