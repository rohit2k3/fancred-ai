// src/components/ai/MintYourMoment.tsx
"use client";

import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Edit3, Zap, AlertTriangle } from 'lucide-react'; // Edit3 for quote, Zap for generation
import { useToast } from "@/hooks/use-toast";


const MintYourMoment = () => {
  const { generatedQuote, fetchGeneratedQuote, isLoadingAiQuote, isWalletConnected } = useUser();
  const [fanActivity, setFanActivity] = useState('');
  const { toast } = useToast();

  const handleGenerateQuote = async () => {
    if (!isWalletConnected) {
      toast({ variant: "destructive", title: "Wallet Not Connected", description: "Please connect your wallet to generate a quote." });
      return;
    }
    if (!fanActivity.trim()) {
      toast({ variant: "destructive", title: "Input Required", description: "Please describe your fan activity first." });
      return;
    }
    await fetchGeneratedQuote(fanActivity);
  };

  const handleMintNFT = () => {
    if (!generatedQuote) {
      toast({ variant: "destructive", title: "No Quote", description: "Generate a quote first before minting." });
      return;
    }
    // Placeholder for actual NFT minting logic
    toast({ title: "Minting Initiated (Mock)", description: "Your Fan Moment NFT minting process has started." });
  };


  return (
    <Card className="w-full relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Edit3 className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-bold">Mint Your Moment</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-3">
          Describe a memorable fan activity or your unique fandom. Our AI will craft a personalized quote for you to mint as an NFT!
        </CardDescription>
        <Textarea
          placeholder="e.g., 'Traveled 500 miles to see the championship game and painted my face with team colors!'"
          value={fanActivity}
          onChange={(e) => setFanActivity(e.target.value)}
          className="min-h-[100px] mb-4"
          aria-label="Describe your fan activity"
          disabled={!isWalletConnected}
        />
        <Button onClick={handleGenerateQuote} disabled={isLoadingAiQuote || !isWalletConnected || !fanActivity.trim()} className="w-full">
          {isLoadingAiQuote ? <LoadingSpinner size="sm" className="mr-2" /> : <Zap className="mr-2 h-4 w-4" />}
          Generate AI Fan Quote
        </Button>
        
        {generatedQuote && (
          <div className="mt-6 p-4 border border-dashed border-primary/50 rounded-lg bg-primary/10">
            <p className="text-lg font-semibold text-primary-foreground text-center italic">"{generatedQuote}"</p>
          </div>
        )}
      </CardContent>
      {generatedQuote && (
        <CardFooter className="pt-4 border-t border-white/10">
          <Button onClick={handleMintNFT} variant="outline" className="w-full" disabled={!isWalletConnected}>
            Mint Quote as NFT (Bonus)
          </Button>
        </CardFooter>
      )}
      {!isWalletConnected && (
         <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 rounded-2xl">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-semibold text-center mb-2">Wallet Not Connected</p>
            <p className="text-sm text-muted-foreground text-center">Please connect your wallet to mint your moment.</p>
        </div>
      )}
    </Card>
  );
};

export default MintYourMoment;
