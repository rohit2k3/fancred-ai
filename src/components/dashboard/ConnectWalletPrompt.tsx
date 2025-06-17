
// src/components/dashboard/ConnectWalletPrompt.tsx
"use client";

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react'; 
import LoadingSpinner from '../ui/LoadingSpinner';

const ConnectWalletPrompt = () => {
  const { connectWallet, isConnecting } = useUser(); // isConnecting reflects thirdweb's connectionStatus === 'connecting'

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
            <Zap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-center">Unlock Your Fan Power</CardTitle>
          <CardDescription className="text-center text-lg">
            Connect your wallet to discover your Superfan Score, mint exclusive badges, and get AI-powered insights!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            size="lg" 
            className="w-full text-lg py-6" 
            onClick={connectWallet}
            disabled={isConnecting}
            aria-label="Connect your wallet to get started"
          >
            {isConnecting ? (
              <LoadingSpinner size="md" className="mr-2" />
            ) : (
              <Zap className="mr-2 h-5 w-5" />
            )}
            {isConnecting ? 'Connecting...' : 'Connect Wallet & Get Started'}
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            We support MetaMask on the Chiliz Spicy Testnet. Ensure your wallet is set to this network.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectWalletPrompt;

