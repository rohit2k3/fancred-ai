
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

const mockRituals = [
  { value: 'chant', label: 'Team Chant', emoji: '📢', description: "Boost morale with a collective chant!" },
  { value: 'wave', label: 'Digital Wave', emoji: '🌊', description: "Start a synchronized digital wave across the fan base." },
  { value: 'pledge', label: 'Loyalty Pledge', emoji: '🤝', description: "Pledge your support with fellow fans." },
  { value: 'predict', label: 'Match Prediction', emoji: '🔮', description: "Lock in your match prediction with others." },
];

const FanRitualCard = () => {
  const { isWalletConnected } = useUser();
  const { toast } = useToast();
  const [selectedRitualValue, setSelectedRitualValue] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState<string>('');

  const handlePerformRitual = () => {
    if (!isWalletConnected) {
      toast({ variant: "destructive", title: "Wallet Not Connected", description: "Please connect your wallet to participate in rituals." });
      return;
    }
    if (!selectedRitualValue) {
      toast({ variant: "destructive", title: "Ritual Not Selected", description: "Please choose a ritual to perform." });
      return;
    }
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({ variant: "destructive", title: "Invalid Stake", description: "Please enter a valid amount to stake (mock)." });
      return;
    }

    const ritual = mockRituals.find(r => r.value === selectedRitualValue);
    if (!ritual) return;

    toast({
      title: "Ritual Initiated (Mock)",
      description: `Performing "${ritual.label}" with a mock stake of ${stakeAmount} CHZ...`,
    });

    // Simulate on-chain interaction & metadata update
    setTimeout(() => {
      toast({
        title: "Ritual Complete! (Mock)",
        description: `Your fan badge is now 'Blessed by ${ritual.emoji} ${Math.floor(Math.random() * 10) + 1}x Fans'! (Simulated metadata update)`,
      });
    }, 2000);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-headline">Fan Collab Rituals</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          Join fellow fans! Perform rituals before a match to boost your team's spirit and enhance your badge.
        </CardDescription>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="ritual-select" className="text-sm font-medium">Choose a Ritual</Label>
            <Select value={selectedRitualValue} onValueChange={setSelectedRitualValue} disabled={!isWalletConnected}>
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
              placeholder="e.g., 5 CHZ"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="mt-1"
              disabled={!isWalletConnected}
            />
             <p className="text-xs text-muted-foreground mt-1">This is a simulation. No real tokens will be locked.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Button onClick={handlePerformRitual} className="w-full" disabled={!isWalletConnected || !selectedRitualValue || !stakeAmount}>
          <Zap className="mr-2 h-4 w-4" />
          Perform Ritual
        </Button>
      </CardFooter>

      {!isWalletConnected && (
         <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 rounded-lg">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-semibold text-center mb-2">Wallet Not Connected</p>
            <p className="text-sm text-muted-foreground text-center">Please connect your wallet to participate in Fan Collab Rituals.</p>
        </div>
      )}
    </Card>
  );
};

export default FanRitualCard;
