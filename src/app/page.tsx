
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
import LeaderboardCard from '@/components/dashboard/LeaderboardCard';
import FanRitualCard from '@/components/dashboard/FanRitualCard';
import FanMarketplaceCard from '@/components/dashboard/FanMarketplaceCard';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, User, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function FanCredDashboard() {
  const { isWalletConnected, isOnCorrectNetwork, fetchGeneratedBadgeArtwork, walletAddress } = useUser();

  const handleMintBadge = async () => {
    await fetchGeneratedBadgeArtwork();
  };

  if (!isWalletConnected) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <ConnectWalletPrompt />
        </main>
      </div>
    );
  }

  if (!isOnCorrectNetwork) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="bg-card p-8 rounded-2xl shadow-xl text-center max-w-md border animate-fade-in-up">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-destructive mb-2">Wrong Network Detected</h2>
            <p className="text-muted-foreground mb-6">
              Your wallet is connected, but you're not on the Chiliz Spicy Testnet. 
              Please switch networks in your wallet or use the button below.
            </p>
             {/* <Button onClick={switchToCorrectNetwork}>
                Switch to Chiliz Spicy
             </Button> */}
            <p className="text-xs text-muted-foreground mt-4">
              FanCred AI features are only available on the Chiliz Spicy Testnet (Chain ID: 88882).
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Enhanced Layout
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]" style={{ animationDelay: '100ms' }}>
                  <ScoreCard />
                </div>
                <div className="animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]" style={{ animationDelay: '200ms' }}>
                  <BadgeCard onMintBadgeClick={handleMintBadge} />
                </div>
              </div>
              <div className="animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]" style={{ animationDelay: '300ms' }}>
                <AiAssistant />
              </div>
              <div className="animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]" style={{ animationDelay: '400ms' }}>
                <LeaderboardCard />
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-8">
              {walletAddress && (
                  <div className="animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]" style={{ animationDelay: '500ms' }}>
                      <Card className="p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center relative">
                          <h3 className="text-xl font-bold mb-2 text-primary">Your Fan Profile</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                              View and share your FanCred status with the world!
                          </p>
                          <Button variant="outline" asChild>
                              <Link href={`/profile/${walletAddress}`}>
                                  <User className="mr-2 h-4 w-4" /> View My Profile
                              </Link>
                          </Button>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground absolute top-4 right-4 cursor-help"/>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>A shareable page showcasing your score, badge, and level.</p>
                              </TooltipContent>
                          </Tooltip>
                      </Card>
                  </div>
              )}
              <div id="fandom-traits-card" className="animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]" style={{ animationDelay: '600ms' }}>
                <FandomTraitsInput />
              </div>
              <div className="animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]" style={{ animationDelay: '700ms' }}>
                <MintYourMoment />
              </div>
              <div className="animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]" style={{ animationDelay: '800ms' }}> 
                <FanRitualCard />
              </div>
              <div className="animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]" style={{ animationDelay: '900ms' }}>
                  <FanMarketplaceCard />
              </div>
              <div className="animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]" style={{ animationDelay: '1000ms' }}>
                  <Card className="p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center relative">
                      <h3 className="text-xl font-bold mb-2 text-primary">Fan Staking Vault</h3>
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
                  </Card>
              </div>
            </div>
          </div>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12">
          FanCred AI &copy; {new Date().getFullYear()} - Chiliz Vibe Hackathon
        </footer>
      </div>
    </TooltipProvider>
  );
}
