// src/components/dashboard/FandomTraitsInput.tsx
"use client";

import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FandomTraitsInput = () => {
  const { fandomTraits, setFandomTraits: setContextFandomTraits } = useUser();
  const [localFandomTraits, setLocalFandomTraits] = useState(fandomTraits);
  const { toast } = useToast();

  const handleSaveTraits = () => {
    setContextFandomTraits(localFandomTraits);
    toast({ title: "Fandom Traits Saved!", description: "Your traits will be used for AI badge generation." });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <UserCheck className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-bold">Define Your Fandom</CardTitle>
        </div>
        <CardDescription>
          Help our AI understand your unique fan identity to generate a personalized badge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="fandom-traits" className="text-sm font-medium">Your Fandom Traits</Label>
          <Textarea
            id="fandom-traits"
            placeholder="e.g., 'Die-hard Lakers fan, collects jerseys, attends every home game, active in online fan communities.'"
            value={localFandomTraits}
            onChange={(e) => setLocalFandomTraits(e.target.value)}
            className="min-h-[100px] mt-1"
            aria-label="Describe your fandom traits"
          />
           <p className="text-xs text-muted-foreground mt-1">This will be used to generate your unique badge artwork.</p>
        </div>
        <Button onClick={handleSaveTraits} className="w-full" disabled={!localFandomTraits.trim()}>
          Save Fandom Traits
        </Button>
      </CardContent>
    </Card>
  );
};

export default FandomTraitsInput;
