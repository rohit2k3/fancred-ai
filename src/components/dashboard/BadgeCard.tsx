
// src/components/dashboard/BadgeCard.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Award, ShieldAlert, Sparkles } from 'lucide-react'; // Award for badge, ShieldAlert for placeholder
import { useToast } from '@/hooks/use-toast';

const BadgeCard = ({ onMintBadgeClick }: { onMintBadgeClick: () => Promise<void> }) => {
  const { generatedBadgeArtwork, isLoadingAiArtwork, fanLevel, superfanScore, fandomTraits, isWalletConnected } = useUser();
  const { toast } = useToast();
  const [isMinting, setIsMinting] = React.useState(false);

  // Determine mint date - mock for now
  const [mintDate, setMintDate] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (generatedBadgeArtwork && !isLoadingAiArtwork) { // Ensure artwork is present and not loading
      setMintDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    } else {
      setMintDate(null);
    }
  }, [generatedBadgeArtwork, isLoadingAiArtwork]);

  const handleInternalMintClick = async () => {
    if (!isWalletConnected) {
        toast({ variant: "destructive", title: "Wallet Not Connected", description: "Please connect your wallet to mint a badge." });
        return;
    }
    if (!fandomTraits.trim()) {
      toast({
        variant: "destructive",
        title: "Fandom Traits Required",
        description: "Please define your fandom traits before minting a badge.",
      });
      const traitsInput = document.getElementById('fandom-traits-card');
      if (traitsInput) traitsInput.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (superfanScore < 100) {
      toast({
        variant: "destructive",
        title: "Score Too Low",
        description: `You need a Superfan Score of at least 100 to mint a badge. Your score is ${superfanScore}.`,
      });
      return;
    }

    setIsMinting(true);
    toast({
      title: "Minting Badge...",
      description: "Generating AI artwork. This may take a moment. (Mock Mint Fee: 1 CHZ)",
      duration: 15000, // Longer duration for AI generation
    });
    
    try {
      await onMintBadgeClick(); // This now calls fetchGeneratedBadgeArtwork from UserContext via page.tsx
      // Success/error toasts are handled within fetchGeneratedBadgeArtwork in UserContext
    } catch (error) {
        // This catch might be redundant if UserContext handles all errors, but good for safety
        toast({ variant: "destructive", title: "Minting Failed", description: "An unexpected error occurred during minting."});
    } finally {
        setIsMinting(false);
    }
  };


  return (
    <Card className="flex flex-col justify-between min-h-[350px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Your Fan Badge</CardTitle>
        <Award className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center flex-grow min-h-[200px]">
        {(isLoadingAiArtwork || isMinting) && !generatedBadgeArtwork && (
          <div className="flex flex-col items-center text-center p-4">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Generating your unique badge...</p>
            <p className="text-xs text-muted-foreground">This can take up to 30 seconds.</p>
          </div>
        )}
        {!isMinting && !isLoadingAiArtwork && generatedBadgeArtwork && (
          <div className="p-2 border border-primary/20 rounded-lg shadow-inner bg-primary/5 hover:scale-105 transition-transform duration-300 animate-in fade-in-0 zoom-in-90 duration-500">
            <Image 
              src={generatedBadgeArtwork} 
              alt="AI Generated Fan Badge Artwork" 
              width={200} 
              height={200} 
              className="rounded-md shadow-lg object-cover aspect-square"
              data-ai-hint="sports fan badge"
              priority={true} // Prioritize loading if artwork is present
            />
          </div>
        )}
        {!isMinting && !isLoadingAiArtwork && !generatedBadgeArtwork && (
          <div className="text-center p-4">
            <ShieldAlert className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-1">Your FanCred Badge isn't minted yet.</p>
            <CardDescription className="mb-4 text-xs">
              Define fandom traits & score 100+ to mint. (Mock Fee: 1 CHZ)
            </CardDescription>
            <Button 
              onClick={handleInternalMintClick} 
              variant="default" 
              disabled={isLoadingAiArtwork || isMinting || !isWalletConnected}
              className={!generatedBadgeArtwork ? "animate-pulse-glow" : ""}
            >
              {isLoadingAiArtwork || isMinting ? <LoadingSpinner size="sm" className="mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Mint Your Badge
            </Button>
          </div>
        )}
      </CardContent>
      {generatedBadgeArtwork && mintDate && !isLoadingAiArtwork && !isMinting && (
        <CardFooter className="flex-col items-start text-sm pt-4 border-t border-white/10">
            <div className="font-semibold text-foreground">Level: <span className="text-accent-foreground">{fanLevel}</span></div>
            <div className="text-muted-foreground">Score: {superfanScore}</div>
            <div className="text-muted-foreground">Minted: {mintDate} (Mock)</div>
        </CardFooter>
      )}
       {(isMinting || isLoadingAiArtwork) && !generatedBadgeArtwork && ( // Show a simplified footer during loading if no badge yet
        <CardFooter className="flex-col items-start text-sm pt-4 border-t border-white/10">
            <div className="text-muted-foreground text-xs">Badge details will appear here after generation.</div>
        </CardFooter>
      )}
    </Card>
  );
};

export default BadgeCard;
