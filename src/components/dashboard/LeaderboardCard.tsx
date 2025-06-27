// src/components/dashboard/LeaderboardCard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ListOrdered, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useUser } from '@/contexts/UserContext';

interface LeaderboardFan {
  rank: number;
  walletAddress: string;
  score: number;
  fanLevel: string;
  avatarText: string;
}

const LeaderboardCard = () => {
  const { walletAddress: currentUserAddress } = useUser();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardFan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-bold">Fan Leaderboard</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          See who's leading the pack in FanCred. Climb the ranks! (Data is live from the chain)
        </CardDescription>
        
        {isLoading && (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
            <p className="ml-2">Loading Leaderboard...</p>
          </div>
        )}
        
        {error && <p className="text-destructive text-center">{error}</p>}
        
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="w-[50px] text-center">Rank</TableHead>
                  <TableHead>Fan</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((fan) => (
                  <TableRow 
                    key={fan.rank} 
                    className={`border-white/10 ${fan.walletAddress.toLowerCase() === currentUserAddress?.toLowerCase() ? 'bg-primary/10' : ''}`}
                  >
                    <TableCell className="font-medium text-center">{fan.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                            {fan.avatarText || <ShieldCheck size={16} />}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-mono text-sm">{`${fan.walletAddress.substring(0, 6)}...${fan.walletAddress.substring(fan.walletAddress.length - 4)}`}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">{fan.score}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium
                          ${fan.fanLevel === 'Legend' ? 'bg-primary/20 text-primary' :
                            fan.fanLevel === 'Pro' ? 'bg-accent/20 text-accent-foreground' :
                            'bg-secondary/80 text-secondary-foreground'}`}
                      >
                        {fan.fanLevel}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Leaderboard is generated from on-chain data for a sample set of addresses. Ritual completion is mocked.
        </p>
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
