// src/components/dashboard/FanMarketplaceCard.tsx
"use client";

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Star, Award, Edit3, ShieldHalf, HelpCircle } from 'lucide-react'; // ShieldHalf for avatar frames
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Perk {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  cost?: string; // e.g., "100 XP" or "5 CHZ" (mock)
  action?: () => void;
  disabled?: boolean;
  tooltip?: string;
}

const FanMarketplaceCard = () => {
  const { isWalletConnected, superfanScore } = useUser();
  const { toast } = useToast();

  const handleRedeemPerk = (perkTitle: string, cost?: string) => {
    if (!isWalletConnected) {
      toast({ variant: "destructive", title: "Wallet Not Connected", description: "Please connect your wallet to redeem perks." });
      return;
    }
    // Mock redemption logic
    toast({
      title: "Perk Redemption (Mock)",
      description: `Attempting to redeem "${perkTitle}". ${cost ? `Mock cost: ${cost}.` : ''} This is a simulation.`,
    });
    // In a real app, this would involve checking XP/CHZ balance and potentially a smart contract interaction
  };

  const perks: Perk[] = [
    {
      id: 'ai-quote-nft',
      title: 'AI Player Quote NFT',
      description: 'Mint a unique, AI-generated quote about your favorite player or team moment.',
      icon: Edit3,
      cost: 'Min. Score 200', // Example requirement, could also be XP or CHZ
      action: () => {
        // This could navigate to the MintYourMoment component or trigger its functionality
        // For simplicity, we'll just show a toast here.
        // The MintYourMoment component is separate on the dashboard.
        if (superfanScore < 200) {
            toast({ variant: "destructive", title: "Requirement Not Met", description: "You need a Superfan Score of at least 200 to mint an AI Quote NFT from here." });
            return;
        }
        toast({ title: "Navigate to Mint Your Moment", description: "Please use the 'Mint Your Moment' card to generate and mint your AI quote NFT." });
      },
      tooltip: "Generate and mint a unique AI quote. See 'Mint Your Moment' section."
    },
    {
      id: 'avatar-frame',
      title: 'Exclusive Avatar Frame',
      description: 'Unlock a special frame for your profile picture to show off your fan status.',
      icon: ShieldHalf,
      cost: '500 XP (Mock)',
      disabled: true,
      tooltip: "Coming soon! Show off your status with a unique avatar frame."
    },
    {
      id: 'superfan-title-nft',
      title: '"Superfan" Title NFT',
      description: 'Claim an NFT that officially designates you as a Superfan on the platform.',
      icon: Award,
      cost: '1000 XP (Mock)',
      disabled: true,
      tooltip: "Coming soon! Get an official Superfan title NFT."
    },
  ];

  return (
    <TooltipProvider>
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-bold">Fan Marketplace</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          Redeem your hard-earned FanCred (XP or Score) for exclusive digital perks and NFTs. More items coming soon!
        </CardDescription>
        
        <div className="space-y-4">
          {perks.map((perk) => (
            <div key={perk.id} className="p-4 border border-white/10 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-start gap-3">
                <perk.icon className="h-8 w-8 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground flex items-center">
                    {perk.title}
                    {perk.tooltip && (
                       <Tooltip>
                        <TooltipTrigger asChild>
                           <HelpCircle className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{perk.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">{perk.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 mt-2 sm:mt-0 shrink-0">
                 {perk.cost && <p className="text-xs font-medium text-primary">{perk.cost}</p>}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => perk.action ? perk.action() : handleRedeemPerk(perk.title, perk.cost)}
                  disabled={!isWalletConnected || perk.disabled}
                  className="w-full sm:w-auto"
                >
                  {perk.disabled ? 'Coming Soon' : (perk.id === 'ai-quote-nft' ? 'Go to Mint' : 'Redeem (Mock)')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
       <CardFooter className="pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground text-center w-full">
                Marketplace features are currently for demonstration. XP and CHZ transactions are simulated.
            </p>
        </CardFooter>
    </Card>
    </TooltipProvider>
  );
};

export default FanMarketplaceCard;
