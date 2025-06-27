// src/app/profile/[walletAddress]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, BarChart2, Award, UserCircle, LogIn, Coins } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FanProfileData {
  walletAddress: string;
  superfanScore: number;
  fanLevel: string;
  nftsHeld: number;
  ritualsCompleted: number; // Note: This will be mocked data from the API
  chzBalance: number;
  badgeArtworkUrl?: string;
  fandomTraits?: string; // Note: This will be mocked data from the API
  joinDate?: string; // Note: This will be mocked data from the API
}

const fetchProfileData = async (address: string): Promise<FanProfileData | null> => {
  const response = await fetch(`/api/profile/${address}`);
  if (!response.ok) {
    throw new Error('Failed to fetch fan profile.');
  }
  return response.json();
};

export default function FanProfilePage() {
  const params = useParams();
  const walletAddress = params.walletAddress as string;

  const [profileData, setProfileData] = useState<FanProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      setIsLoading(true);
      fetchProfileData(walletAddress)
        .then(data => {
          if (data) {
            setProfileData(data);
          } else {
            setError("Fan profile not found.");
          }
        })
        .catch(err => {
          console.error("Error fetching profile:", err);
          setError("Failed to load fan profile. The address might be invalid or an error occurred.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
        setError("No wallet address provided in URL.");
        setIsLoading(false);
    }
  }, [walletAddress]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
            <p className="ml-4 text-lg">Loading Fan Profile from On-Chain Data...</p>
          </div>
        )}
        {error && (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-destructive text-center">Error</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button asChild variant="outline">
                        <Link href="/">
                            <LogIn className="mr-2 h-4 w-4" /> Go to Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )}
        {!isLoading && !error && profileData && (
          <Card className="max-w-3xl mx-auto overflow-hidden">
            <CardHeader className="bg-white/5 p-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {profileData.badgeArtworkUrl ? (
                  <Image
                    src={profileData.badgeArtworkUrl}
                    alt={`${profileData.walletAddress}'s Fan Badge`}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-primary shadow-lg object-cover"
                    data-ai-hint="fan badge"
                  />
                ) : (
                  <UserCircle className="h-24 w-24 text-primary" />
                )}
                <div>
                  <CardTitle className="text-3xl font-bold text-primary">
                    Fan Profile
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1 font-mono break-all">
                    {profileData.walletAddress}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-1">Joined: {profileData.joinDate || 'N/A'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 rounded-lg shadow-inner">
                  <h3 className="text-lg font-semibold flex items-center text-primary mb-2">
                    <BarChart2 className="mr-2 h-5 w-5" /> Superfan Score
                  </h3>
                  <p className="text-4xl font-bold text-primary">{profileData.superfanScore}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg shadow-inner">
                  <h3 className="text-lg font-semibold flex items-center text-primary mb-2">
                    <Award className="mr-2 h-5 w-5" /> Fan Level
                  </h3>
                  <p className="text-3xl font-bold">{profileData.fanLevel}</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg shadow-inner">
                <h3 className="text-lg font-semibold flex items-center text-primary mb-2">
                  <ShieldCheck className="mr-2 h-5 w-5" /> On-Chain Stats
                </h3>
                <ul className="space-y-1 text-sm">
                  <li><strong>NFTs Held:</strong> {profileData.nftsHeld}</li>
                  <li><strong>Rituals Completed:</strong> {profileData.ritualsCompleted} (Mocked)</li>
                  <li className="flex items-center">
                    <strong>CHZ Balance:</strong> {profileData.chzBalance.toFixed(4)} <Coins className="ml-1 h-3 w-3" />
                  </li>
                </ul>
              </div>

              {profileData.fandomTraits && (
                <div className="p-4 bg-white/5 rounded-lg shadow-inner">
                    <h3 className="text-lg font-semibold flex items-center text-primary mb-2">
                        Fandom Identity
                    </h3>
                    <p className="text-sm italic">"{profileData.fandomTraits}"</p>
                </div>
              )}

              <div className="text-center mt-4">
                <Button asChild variant="default">
                  <Link href="/">
                    <LogIn className="mr-2 h-4 w-4" /> Back to Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-white/10">
          FanCred AI &copy; {new Date().getFullYear()} - View Only Profile
      </footer>
    </div>
  );
}
