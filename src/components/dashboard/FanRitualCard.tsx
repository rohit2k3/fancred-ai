
// src/components/dashboard/FanRitualCard.tsx
"use client";

import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Zap, Users, AlertTriangle } from 'lucide-react'; // Zap for ritual, Users for collab
import LoadingSpinner from '../ui/LoadingSpinner';

const mockRituals = [
  { value: 'chant', label: 'Team Chant', emoji: '📢', description: "Boost morale with a collective chant!" },
  { value: 'wave', label: 'Digital Wave', emoji: '🌊', description: "Start a synchronized digital wave across the fan base." },
  { value: 'pledge', label: 'Loyalty Pledge', emoji: '🤝', description: "Pledge your support with fellow fans." },
  { value: 'predict', label: 'Match Prediction', emoji: '🔮', description: "Lock in your match prediction with others." },
];

const FanRitualCard = () => {
  const { isWalletConnected, updateScoreOnAction, isLoadingScore } = useUser();
  const { toast } = useToast();
  const [selectedRitualValue, setSelectedRitualValue] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState<string>(''); // Kept for UI, but not used in score update yet

  const handlePerformRitual = async () => {
    if (!isWalletConnected) {
      toast({ variant: "destructive", title: "Wallet Not Connected", description: "Please connect your wallet to participate in rituals." });
      return;
    }
    if (!selectedRitualValue) {
      toast({ variant: "destructive", title: "Ritual Not Selected", description: "Please choose a ritual to perform." });
      return;
    }
    // Stake amount validation can be added if it's used for real logic beyond mock
    // if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
    //   toast({ variant: "destructive", title: "Invalid Stake", description: "Please enter a valid amount to stake (mock)." });
    //   return;
    // }

    const ritual = mockRituals.find(r => r.value === selectedRitualValue);
    if (!ritual) return;

    toast({
      title: "Ritual Initiated (Mock)",
      description: `Performing "${ritual.label}"... Mock stake of ${stakeAmount || 0} CHZ.`,
    });

    // Call the context function to update score (simulates on-chain interaction leading to score change)
    await updateScoreOnAction('complete_ritual');

    // Simulate additional metadata update toast after score update
    // This part can be refined when actual NFT minting/metadata update logic is in place
    setTimeout(() => {
        if (!isLoadingScore) { // Check if score update has finished
            toast({
                title: "Ritual Effects (Mock)",
                description: `Your fan badge is now 'Blessed by ${ritual.emoji} ${Math.floor(Math.random() * 10) + 1} Fans'! (Simulated metadata update)`,
            });
        }
    }, 500); // Short delay to allow score update toast to appear first
  };

  return (
    <Card className="w-full relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-bold">Fan Collab Rituals</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          Join fellow fans! Perform rituals before a match to boost your team's spirit and enhance your badge. Each ritual increases your Superfan Score!
        </CardDescription>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="ritual-select" className="text-sm font-medium">Choose a Ritual</Label>
            <Select value={selectedRitualValue} onValueChange={setSelectedRitualValue} disabled={!isWalletConnected || isLoadingScore}>
              <SelectTrigger id="ritual-select" className="w-full mt-1">
                <SelectValue placeholder="Select a ritual..." />
              </SelectTrigger>
              <SelectContent>
                {mockRituals.map((ritual) => (
                  <SelectItem key={ritual.value} value={ritual.value}>
                    {ritual.emoji} {ritual.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRitualValue && (
                <p className="text-xs text-muted-foreground mt-1">
                    {mockRituals.find(r => r.value === selectedRitualValue)?.description}
                </p>
            )}
          </div>

          <div>
            <Label htmlFor="stake-amount" className="text-sm font-medium">Mock Stake Amount (CHZ)</Label>
            <Input
              id="stake-amount"
              type="number"
              placeholder="e.g., 5 CHZ (for display only)"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="mt-1"
              disabled={!isWalletConnected || isLoadingScore}
            />
             <p className="text-xs text-muted-foreground mt-1">This is a simulation. No real tokens will be locked. Score updates are mocked.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t border-white/10">
        <Button onClick={handlePerformRitual} className="w-full" disabled={!isWalletConnected || !selectedRitualValue || isLoadingScore}>
          {isLoadingScore ? <LoadingSpinner size="sm" className="mr-2" /> : <Zap className="mr-2 h-4 w-4" />}
          Perform Ritual & Boost Score
        </Button>
      </CardFooter>

      {!isWalletConnected && (
         <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 rounded-2xl">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-semibold text-center mb-2">Wallet Not Connected</p>
            <p className="text-sm text-muted-foreground text-center">Please connect your wallet to participate in Fan Collab Rituals.</p>
        </div>
      )}
    </Card>
  );
};

export default FanRitualCard;
