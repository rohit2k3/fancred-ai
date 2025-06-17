
// src/components/wallet/WalletInfo.tsx
"use client";

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Wallet, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const WalletInfo = () => {
  const { 
    walletAddress, 
    isWalletConnected, 
    isOnCorrectNetwork,
    connectWallet, 
    disconnectWallet, 
    switchToCorrectNetwork,
    isConnecting // This now primarily reflects thirdweb's connectionStatus === 'connecting'
  } = useUser();

  if (isWalletConnected && walletAddress) {
    if (!isOnCorrectNetwork) {
        return (
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 p-2 border border-destructive rounded-md bg-destructive/10 text-sm shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
                    <span className="font-medium text-destructive-foreground">Wrong Network</span>
                </div>
                <Button variant="destructive" size="sm" onClick={switchToCorrectNetwork} disabled={isConnecting}>
                    {isConnecting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    Switch to Chiliz Spicy
                </Button>
                <Button variant="outline" size="sm" onClick={disconnectWallet} disabled={isConnecting} aria-label="Disconnect wallet">
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                </Button>
            </div>
        );
    }
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 p-2 border border-border rounded-md bg-card text-sm shadow-sm">
          <Wallet className="h-5 w-5 text-primary" />
          <span className="font-mono text-foreground">
            {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={disconnectWallet} disabled={isConnecting} aria-label="Disconnect wallet">
          {isConnecting && <LoadingSpinner size="sm" className="mr-2" />}
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  // Not connected or address not available
  return (
    <Button onClick={connectWallet} variant="default" disabled={isConnecting} aria-label="Connect wallet">
      {isConnecting ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : (
        <LogIn className="mr-2 h-4 w-4" />
      )}
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};

export default WalletInfo;

