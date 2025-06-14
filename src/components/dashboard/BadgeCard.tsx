// src/components/dashboard/BadgeCard.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Award, ShieldAlert } from 'lucide-react'; // Award for badge, ShieldAlert for placeholder

const BadgeCard = ({ onMintBadgeClick }: { onMintBadgeClick: () => void }) => {
  const { generatedBadgeArtwork, isLoadingAiArtwork, fanLevel, superfanScore } = useUser();

  // Determine mint date - mock for now
  const [mintDate, setMintDate] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (generatedBadgeArtwork) {
      setMintDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    } else {
      setMintDate(null);
    }
  }, [generatedBadgeArtwork]);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-headline">Your Fan Badge</CardTitle>
        <Award className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center min-h-[250px]">
        {isLoadingAiArtwork ? (
          <div className="flex flex-col items-center text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-muted-foreground">Generating your unique badge...</p>
          </div>
        ) : generatedBadgeArtwork ? (
          <Image 
            src={generatedBadgeArtwork} 
            alt="Fan Badge Artwork" 
            width={200} 
            height={200} 
            className="rounded-lg shadow-md object-cover"
            data-ai-hint="sports badge fan"
          />
        ) : (
          <div className="text-center">
            <ShieldAlert className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Your FanCred Badge isn't minted yet.</p>
            <Button onClick={onMintBadgeClick} variant="default">
              Mint Your Badge
            </Button>
            <CardDescription className="mt-2 text-xs">
              Show off your fandom with a unique, AI-generated badge! (Fee: 1 CHZ)
            </CardDescription>
          </div>
        )}
      </CardContent>
      {generatedBadgeArtwork && mintDate && (
        <CardFooter className="flex-col items-start text-sm pt-4 border-t">
            <div className="font-semibold text-foreground">Level: <span className="text-accent">{fanLevel}</span></div>
            <div className="text-muted-foreground">Score: {superfanScore}</div>
            <div className="text-muted-foreground">Minted: {mintDate}</div>
        </CardFooter>
      )}
    </Card>
  );
};

export default BadgeCard;
