// src/app/page.tsx
"use client";

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import Header from '@/components/layout/Header';
import ConnectWalletPrompt from '@/components/dashboard/ConnectWalletPrompt';
import ScoreCard from '@/components/dashboard/ScoreCard';
import BadgeCard from '@/components/dashboard/BadgeCard';
import AiAssistant from '@/components/ai/AiAssistant';
import MintYourMoment from '@/components/ai/MintYourMoment';
import FandomTraitsInput from '@/components/dashboard/FandomTraitsInput';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

export default function FanCredDashboard() {
  const { isWalletConnected, fetchGeneratedBadgeArtwork, fandomTraits, isLoadingAiArtwork, generatedBadgeArtwork, superfanScore } = useUser();
  const { toast } = useToast();

  const handleMintBadge = async () => {
    if (!fandomTraits.trim()) {
      toast({
        variant: "destructive",
        title: "Fandom Traits Required",
        description: "Please define your fandom traits before minting a badge.",
      });
      // Scroll to FandomTraitsInput or highlight it
      const traitsInput = document.getElementById('fandom-traits-card');
      if (traitsInput) traitsInput.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (superfanScore < 100) { // Example threshold
      toast({
        variant: "destructive",
        title: "Score Too Low",
        description: `You need a Superfan Score of at least 100 to mint a badge. Your score is ${superfanScore}.`,
      });
      return;
    }

    // Simulate minting fee
    toast({
      title: "Minting Badge (1 CHZ)",
      description: "Confirming transaction...",
    });
    
    // Call AI artwork generation
    await fetchGeneratedBadgeArtwork();
    // In a real scenario, after artwork, trigger smart contract mint
    // For now, artwork generation itself is the "minting" success
  };

  if (!isWalletConnected) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <ConnectWalletPrompt />
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            
            <div className="lg:col-span-1 xl:col-span-1">
              <ScoreCard />
            </div>

            <div className="lg:col-span-1 xl:col-span-1">
              <BadgeCard onMintBadgeClick={handleMintBadge} />
            </div>

            <div id="fandom-traits-card" className="lg:col-span-2 xl:col-span-2 row-start-2 md:row-start-auto md:col-start-1 lg:col-start-auto">
              <FandomTraitsInput />
            </div>
            
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-2">
              <AiAssistant />
            </div>

            <div className="md:col-span-2 lg:col-span-3 xl:col-span-2">
              <MintYourMoment />
            </div>

            {/* Placeholder for Revenue Model/Staking (Phase 5) */}
            <div className="md:col-span-2 lg:col-span-1 xl:col-span-2 bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-headline mb-2 text-primary">Fan Staking Vault</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Boost your FanCred! Stake CHZ to earn exclusive perks and increase your Superfan Score.
                </p>
                <Button variant="outline" disabled>
                    Coming Soon
                </Button>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground absolute top-4 right-4 cursor-help"/>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Stake Chiliz tokens to unlock special rewards and accelerate your fan status. (Future Feature)</p>
                    </TooltipContent>
                </Tooltip>
            </div>
          </div>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t">
          FanCred AI &copy; {new Date().getFullYear()} - Chiliz Vibe Hackathon
        </footer>
      </div>
    </TooltipProvider>
  );
}
