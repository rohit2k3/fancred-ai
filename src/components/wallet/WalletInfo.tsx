// src/components/wallet/WalletInfo.tsx
"use client";

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Wallet, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useChainId, useSwitchChain } from '@thirdweb-dev/react';
import { ChilizSpicy } from '@thirdweb-dev/chains';
import { useToast } from '@/hooks/use-toast';


const WalletInfo = () => {
  const { walletAddress, isWalletConnected, connectWallet, disconnectWallet, isConnecting } = useUser();
  const currentChainId = useChainId();
  const switchChain = useSwitchChain();
  const { toast } = useToast();

  const handleSwitchNetwork = async () => {
    if (!switchChain) {
        toast({variant: "destructive", title: "Error", description: "Network switching not available."})
        return;
    }
    try {
        await switchChain(ChilizSpicy.chainId);
        toast({title: "Network Switched", description: "Successfully switched to Chiliz Spicy Testnet."});
    } catch (error) {
        console.error("Failed to switch network:", error);
        toast({variant: "destructive", title: "Network Switch Failed", description: "Could not switch to Chiliz Spicy Testnet. Please try from your wallet."});
    }
  }

  if (isWalletConnected && walletAddress) {
    if (currentChainId !== ChilizSpicy.chainId) {
        return (
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 p-2 border border-destructive rounded-md bg-destructive/10 text-sm shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
                    <span className="font-medium text-destructive-foreground">Wrong Network</span>
                </div>
                <Button variant="destructive" size="sm" onClick={handleSwitchNetwork} disabled={isConnecting}>
                    Switch to Chiliz Spicy
                </Button
                ><Button variant="outline" size="sm" onClick={disconnectWallet} disabled={isConnecting} aria-label="Disconnect wallet">
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                </Button>
            </div>
        )
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
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }


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
