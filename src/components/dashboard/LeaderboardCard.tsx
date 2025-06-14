// src/components/dashboard/LeaderboardCard.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ListOrdered, ShieldCheck } from 'lucide-react'; // ListOrdered for leaderboard, ShieldCheck for fallback

// Mock data for the leaderboard
const mockLeaderboardData = [
  { rank: 1, walletAddress: '0xAlpha...Bravo', score: 980, fanLevel: 'Legend', avatarText: 'AB' },
  { rank: 2, walletAddress: '0xCharlie...Delta', score: 955, fanLevel: 'Legend', avatarText: 'CD' },
  { rank: 3, walletAddress: '0xEcho...Foxtrot', score: 920, fanLevel: 'Legend', avatarText: 'EF' },
  { rank: 4, walletAddress: '0xGolf...Hotel', score: 880, fanLevel: 'Pro', avatarText: 'GH' },
  { rank: 5, walletAddress: '0xIndia...Juliet', score: 850, fanLevel: 'Pro', avatarText: 'IJ' },
  { rank: 6, walletAddress: '0xKilo...Lima', score: 790, fanLevel: 'Pro', avatarText: 'KL' },
  { rank: 7, walletAddress: '0xMike...November', score: 720, fanLevel: 'Pro', avatarText: 'MN' },
  { rank: 8, walletAddress: '0xOscar...Papa', score: 650, fanLevel: 'Rookie', avatarText: 'OP' },
  { rank: 9, walletAddress: '0xQuebec...Romeo', score: 580, fanLevel: 'Rookie', avatarText: 'QR' },
  { rank: 10, walletAddress: '0xSierra...Tango', score: 510, fanLevel: 'Rookie', avatarText: 'ST' },
];

const LeaderboardCard = () => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-headline">Fan Leaderboard</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          See who's leading the pack in FanCred. Climb the ranks!
        </CardDescription>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">Rank</TableHead>
                <TableHead>Fan</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLeaderboardData.map((fan) => (
                <TableRow key={fan.rank}>
                  <TableCell className="font-medium text-center">{fan.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {/* Placeholder for actual avatar image if available */}
                        {/* <AvatarImage src={`https://placehold.co/40x40.png`} alt={fan.walletAddress} /> */}
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
                        ${fan.fanLevel === 'Legend' ? 'bg-yellow-400/20 text-yellow-600' : 
                          fan.fanLevel === 'Pro' ? 'bg-blue-400/20 text-blue-600' : 
                          'bg-green-400/20 text-green-600'}`}
                    >
                      {fan.fanLevel}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Leaderboard is currently showing mock data. Real-time updates coming soon!
        </p>
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
