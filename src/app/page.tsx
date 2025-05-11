import { Button } from "@/components/ui/button";
import { CheckCircle, Wallet } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1">
      <div className="container flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl">
            StreamFlow Airdrop Claimer
          </h1>
          <p className="text-lg text-muted-foreground">
            Check and claim your StreamFlow airdrops in one place
          </p>
        </div>

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90" asChild>
            <Link href="/check">
              <CheckCircle className="mr-2 h-5 w-5" />
              Check Eligibility
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 border-primary text-primary hover:bg-primary/10"
            asChild
          >
            <Link href="/claim">
              <Wallet className="mr-2 h-5 w-5" />
              Claim Airdrop
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
