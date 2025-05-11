"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDistributorApi } from "@/lib/api/distributor";
import { useClaimantApi } from "@/lib/api/claimant";
import { formatNumber } from "@/lib/utils/utils";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DistributorResponse } from "@/types/distributor";
import { useWallet } from "@solana/wallet-adapter-react";
import { ClaimantResponse } from "@/types/claimant";
import { claimAirdrop } from "@/utils/StreamFlowUtils";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";

const BN_DIVISOR = 1000000;

export default function DistributorPage() {
  const params = useParams();
  const router = useRouter();
  const { connected, publicKey, wallet } = useWallet();
  const { getDistributorInfo } = useDistributorApi();
  const { getClaimantInfo } = useClaimantApi();
  const [distributor, setDistributor] = useState<DistributorResponse>();
  const [claimant, setClaimant] = useState<ClaimantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Memoize the address and public key to prevent unnecessary re-renders
  const memoizedAddress = useMemo(() => params.address as string, [params.address]);
  const memoizedPublicKey = useMemo(() => publicKey?.toString(), [publicKey]);

  // Fetch all data in a single function
  const fetchData = useCallback(async () => {
    if (!memoizedAddress || !connected || !memoizedPublicKey) return;

    try {
      setLoading(true);
      setError(null);
      const [distributorData, claimantData] = await Promise.all([
        getDistributorInfo(memoizedAddress),
        getClaimantInfo(memoizedAddress, memoizedPublicKey),
      ]);
      setDistributor(distributorData);
      setClaimant(claimantData);
    } catch (err: unknown) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [memoizedAddress, connected, memoizedPublicKey, getDistributorInfo, getClaimantInfo]);

  // Handle wallet connection
  useEffect(() => {
    if (!connected) {
      router.push("/");
      toast.error("Please connect your wallet to view this page");
    }
  }, [connected, router]);

  // Fetch data when necessary dependencies change
  useEffect(() => {
    if (connected && memoizedPublicKey) {
      fetchData();
    }
  }, [connected, memoizedPublicKey, fetchData]);

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }, []);

  const handleClaim = useCallback(async () => {
    if (!distributor || !claimant || !wallet?.adapter || !publicKey) {
      toast.error("Missing required data for claiming");
      return;
    }

    // Type check for SignerWalletAdapter
    const adapter = wallet.adapter as SignerWalletAdapter;
    if (!adapter.signTransaction || !adapter.signAllTransactions) {
      toast.error("Your wallet does not support signing transactions");
      return;
    }

    setIsClaiming(true);
    try {
      await claimAirdrop(claimant, adapter);
      toast.success("Airdrop claimed successfully!");
      // Refresh data after successful claim
      await fetchData();
    } catch (err) {
      console.error("Claim failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to claim airdrop";
      toast.error(errorMessage);
    } finally {
      setIsClaiming(false);
    }
  }, [distributor, claimant, wallet?.adapter, publicKey, fetchData]);

  if (!connected) return null;

  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto">
        {loading ? (
          <CardContent className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        ) : error ? (
          <CardContent className="flex items-center justify-center py-20 text-red-500">
            {error}
          </CardContent>
        ) : !distributor ? (
          <CardContent className="flex items-center justify-center py-20 text-muted-foreground">
            Distributor not found
          </CardContent>
        ) : (
          <>
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-primary">
                  {distributor.name}
                </CardTitle>
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
                  <Badge variant="outline">
                    {parseFloat(distributor.totalAmountUnlocked) ===
                    parseFloat(distributor.maxTotalClaim)
                      ? "Instant"
                      : parseFloat(distributor.totalAmountLocked) ===
                          parseFloat(distributor.maxTotalClaim)
                        ? "Yet to be Unlocked"
                        : parseFloat(distributor.totalAmountUnlocked) > 0
                          ? "Instant"
                          : "Yet to be Unlocked"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-bold text-primary">Token:</span>
                <span className="font-medium">{distributor.mint}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopy(distributor.mint, "Token mint")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-bold text-primary">Recipients:</span>
                <span className="font-medium">
                  {formatNumber(parseInt(distributor.maxNumNodes), 0)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Airdrop Addresses</CardTitle>
                  </CardHeader>
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
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Airdrop Stats (For all)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">Total Unlocked</span>
                        <span className="font-medium">
                          {formatNumber(
                            parseFloat(distributor.totalAmountUnlocked) / BN_DIVISOR,
                            2,
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">Total Locked</span>
                        <span className="font-medium">
                          {formatNumber(parseFloat(distributor.totalAmountLocked) / BN_DIVISOR, 2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">Max Total Claim</span>
                        <span className="font-medium">
                          {formatNumber(parseFloat(distributor.maxTotalClaim) / BN_DIVISOR, 2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {!loading && !error && distributor && (
        <div className="max-w-4xl mx-auto mt-4 space-y-4">
          {claimant && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Airdrop Stats (For you)</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">Your Claimable Amount</span>
                    <span className="font-medium">
                      {formatNumber(parseFloat(claimant.amountUnlocked) / BN_DIVISOR, 2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">Locked Amount</span>
                    <span className="font-medium">
                      {formatNumber(parseFloat(claimant.amountLocked) / BN_DIVISOR, 2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">Amount Already Claimed</span>
                    <span className="font-medium">
                      {formatNumber(parseFloat(claimant.amountClaimed) / BN_DIVISOR, 2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {claimant ? (
            <div className="flex justify-center">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={handleClaim}
                disabled={isClaiming}
              >
                {isClaiming ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Claiming...
                  </div>
                ) : (
                  "Claim Airdrop"
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center text-red-500 font-medium">
              You are not entitled to claim this airdrop. Please connect the correct wallet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
