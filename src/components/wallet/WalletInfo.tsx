// src/components/wallet/WalletInfo.tsx
"use client";

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Wallet, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

const WalletInfo = () => {
  const { walletAddress, isWalletConnected, connectWallet, disconnectWallet } = useUser();

  if (isWalletConnected && walletAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 p-2 border border-border rounded-md bg-card text-sm shadow-sm">
          <Wallet className="h-5 w-5 text-primary" />
          <span className="font-mono text-foreground">
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

  // Check if MetaMask is installed - window.ethereum might be undefined on server initially
  const [hasMetaMask, setHasMetaMask] = React.useState(false);
  React.useEffect(() => {
    setHasMetaMask(typeof window.ethereum !== 'undefined');
  }, []);

  if (!hasMetaMask && typeof window !== 'undefined') { // Check typeof window to ensure client-side
    return (
      <div className="flex items-center gap-2 p-2 border border-destructive/50 rounded-md bg-destructive/10 text-sm text-destructive shadow-sm">
        <AlertTriangle className="h-5 w-5" />
        <span>MetaMask Not Detected</span>
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
