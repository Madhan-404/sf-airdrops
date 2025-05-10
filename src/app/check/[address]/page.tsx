"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AirdropCard } from "@/components/AirdropCard";
import { useAirdropApi } from "@/lib/api/airdrop";
import { AirdropItem } from "@/types/airdrop";
import { Loading } from "@/components/ui/loading";

// Cache implementation for airdrops
const airdropCache = new Map<string, { data: AirdropItem[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function CheckAddressPage() {
  const params = useParams();
  const { getClaimableAirdrops } = useAirdropApi();
  const [airdrops, setAirdrops] = useState<AirdropItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAirdrops = useCallback(async (address: string) => {
    // Check cache first
    const cached = airdropCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setAirdrops(cached.data);
      setLoading(false);
      return;
    }

    try {
      const response = await getClaimableAirdrops(address);
      const items = response.items;
      
      // Update cache
      airdropCache.set(address, { data: items, timestamp: Date.now() });
      
      setAirdrops(items);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [getClaimableAirdrops]);

  useEffect(() => {
    if (!params.address) return;
    fetchAirdrops(params.address as string);
  }, [params.address, fetchAirdrops]);

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
