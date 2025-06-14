// src/components/dashboard/ScoreCard.tsx
"use client";

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

const ScoreCard = () => {
  const { superfanScore, fanLevel } = useUser();
  const progressValue = Math.min((superfanScore / 1000) * 100, 100); // Assuming max score is 1000

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-headline">Your Superfan Score</CardTitle>
        <Trophy className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold text-primary">{superfanScore}</div>
        <p className="text-sm text-muted-foreground mt-1">
          Current Level: <span className="font-semibold text-accent">{fanLevel}</span>
        </p>
        <Progress value={progressValue} className="w-full mt-4 h-3" aria-label={`Superfan score progress: ${progressValue}%`} />
        <CardDescription className="mt-2 text-xs">
          {superfanScore < 300 && "Keep engaging to level up!"}
          {superfanScore >= 300 && superfanScore < 700 && "You're a true fan! Aim for Legend!"}
          {superfanScore >= 700 && "Wow, a true FanCred Legend!"}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
