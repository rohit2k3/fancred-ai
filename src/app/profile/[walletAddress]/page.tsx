// src/app/profile/[walletAddress]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, BarChart2, Award, UserCircle, LogIn, Coins, CalendarDays, BookUser } from 'lucide-react';
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
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <Card className="overflow-hidden">
              <CardHeader className="bg-card/50 p-6 border-b text-center">
                <div className="flex justify-center mb-4">
                  {profileData.badgeArtworkUrl ? (
                    <Image
                      src={profileData.badgeArtworkUrl}
                      alt={`${profileData.walletAddress}'s Fan Badge`}
                      width={140}
                      height={140}
                      className="rounded-full border-4 border-primary shadow-lg object-cover"
                      data-ai-hint="fan badge"
                      priority
                    />
                  ) : (
                    <UserCircle className="h-32 w-32 text-primary" />
                  )}
                </div>
                <CardTitle className="text-3xl font-bold text-primary">
                  {profileData.fanLevel} Fan
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1 font-mono break-all">
                  {profileData.walletAddress}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <BarChart2 className="mr-3 h-5 w-5 text-primary" /> Superfan Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-5xl font-bold text-primary">{profileData.superfanScore}</p>
                        <p className="text-sm text-muted-foreground">out of 1000</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <ShieldCheck className="mr-3 h-5 w-5 text-primary" /> On-Chain Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-muted-foreground">NFTs Held:</span>
                          <span className="font-bold text-lg">{profileData.nftsHeld}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-muted-foreground">Rituals Completed:</span>
                          <span className="font-bold text-lg">{profileData.ritualsCompleted} <span className="text-xs">(Mocked)</span></span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-muted-foreground flex items-center">CHZ Balance: <Coins className="ml-1.5 h-4 w-4" /></span>
                          <span className="font-bold text-lg">{profileData.chzBalance.toFixed(4)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                     <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <BookUser className="mr-3 h-5 w-5 text-primary" /> Fandom Identity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {profileData.fandomTraits ? (
                            <p className="text-sm italic text-muted-foreground">"{profileData.fandomTraits}"</p>
                        ): (
                            <p className="text-sm text-muted-foreground">No fandom traits defined yet.</p>
                        )}
                      </CardContent>
                    </Card>
                     <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <CalendarDays className="mr-3 h-5 w-5 text-primary" /> Fan Since
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold">{profileData.joinDate || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">(Mock Data)</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <Button asChild>
                    <Link href="/">
                      <LogIn className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-8">
          FanCred AI &copy; {new Date().getFullYear()} - View Only Profile
      </footer>
    </div>
  );
}
