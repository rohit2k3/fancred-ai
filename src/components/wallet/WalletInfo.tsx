// src/components/wallet/WalletInfo.tsx
"use client";

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Wallet } from 'lucide-react';

const WalletInfo = () => {
  const { walletAddress, isWalletConnected, connectWallet, disconnectWallet } = useUser();

  if (isWalletConnected && walletAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 p-2 border border-border rounded-md bg-card text-sm">
          <Wallet className="h-5 w-5 text-primary" />
          <span className="font-mono">
            {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={disconnectWallet} aria-label="Disconnect wallet">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connectWallet} variant="default" aria-label="Connect wallet">
      <LogIn className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
};

export default WalletInfo;
