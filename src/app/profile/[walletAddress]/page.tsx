// src/app/profile/[walletAddress]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Correct hook for App Router
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, BarChart2, Award, UserCircle, LogIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Mock data structure - in a real app, this would come from your backend/DB
interface FanProfileData {
  walletAddress: string;
  superfanScore: number;
  fanLevel: string;
  nftsHeld: number;
  ritualsCompleted: number;
  badgeArtworkUrl?: string; // URL to the generated badge image
  fandomTraits?: string; // A summary of their fandom
  joinDate?: string; // Date they first connected
}

// Mock function to fetch profile data
// Replace this with an actual API call in a real application
const fetchMockProfileData = async (address: string): Promise<FanProfileData | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // For demo, let's generate some plausible mock data based on the address
  // In a real app, you'd query your database using the address
  if (address) {
    const score = Math.floor(Math.random() * 800) + 100; // Score between 100 and 900
    let level = "Rookie";
    if (score > 700) level = "Legend";
    else if (score > 300) level = "Pro";

    return {
      walletAddress: address,
      superfanScore: score,
      fanLevel: level,
      nftsHeld: Math.floor(Math.random() * 10),
      ritualsCompleted: Math.floor(Math.random() * 20),
      // badgeArtworkUrl: `https://placehold.co/200x200.png?text=Badge+${address.slice(-3)}`,
      badgeArtworkUrl: `https://placehold.co/300x300.png`, // Generic placeholder
      fandomTraits: "Passionate supporter, enjoys collecting digital memorabilia.",
      joinDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleDateString(), // Random date in last 30 days
    };
  }
  return null;
};


export default function FanProfilePage() {
  const params = useParams();
  const walletAddress = params.walletAddress as string; // Type assertion

  const [profileData, setProfileData] = useState<FanProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      setIsLoading(true);
      fetchMockProfileData(walletAddress)
        .then(data => {
          if (data) {
            setProfileData(data);
          } else {
            setError("Fan profile not found.");
          }
        })
        .catch(err => {
          console.error("Error fetching profile:", err);
          setError("Failed to load fan profile.");
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
            <p className="ml-4 text-lg">Loading Fan Profile...</p>
          </div>
        )}
        {error && (
            <Card className="max-w-2xl mx-auto shadow-xl">
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
          <Card className="max-w-3xl mx-auto shadow-2xl overflow-hidden">
            <CardHeader className="bg-card-foreground/5 p-6 border-b">
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
                  <CardTitle className="text-3xl font-headline text-primary">
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
                <div className="p-4 bg-muted/30 rounded-lg shadow">
                  <h3 className="text-lg font-semibold flex items-center text-accent mb-2">
                    <BarChart2 className="mr-2 h-5 w-5" /> Superfan Score
                  </h3>
                  <p className="text-4xl font-bold text-primary">{profileData.superfanScore}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg shadow">
                  <h3 className="text-lg font-semibold flex items-center text-accent mb-2">
                    <Award className="mr-2 h-5 w-5" /> Fan Level
                  </h3>
                  <p className="text-3xl font-bold">{profileData.fanLevel}</p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg shadow">
                <h3 className="text-lg font-semibold flex items-center text-accent mb-2">
                  <ShieldCheck className="mr-2 h-5 w-5" /> Fan Stats
                </h3>
                <ul className="space-y-1 text-sm">
                  <li><strong>NFTs Held:</strong> {profileData.nftsHeld}</li>
                  <li><strong>Rituals Completed:</strong> {profileData.ritualsCompleted}</li>
                </ul>
              </div>

              {profileData.fandomTraits && (
                <div className="p-4 bg-muted/30 rounded-lg shadow">
                    <h3 className="text-lg font-semibold flex items-center text-accent mb-2">
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
         {!isLoading && !profileData && !error && (
            <Card className="max-w-2xl mx-auto shadow-xl">
                <CardHeader>
                    <CardTitle className="text-primary text-center">Profile Not Found</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">Could not load profile data for the specified address.</p>
                     <Button asChild variant="outline">
                        <Link href="/">
                            <LogIn className="mr-2 h-4 w-4" /> Go to Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
          FanCred AI &copy; {new Date().getFullYear()} - View Only Profile
      </footer>
    </div>
  );
}
