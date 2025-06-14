// src/contexts/UserContext.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { aiGenerateBadgeArtwork } from '@/ai/flows/ai-generate-badge-artwork';
import { generateFanQuote } from '@/ai/flows/mint-your-moment';
import { improveFanScoreSuggestions } from '@/ai/flows/improve-fan-score-suggestions';
import { useToast } from "@/hooks/use-toast";

const CHILIZ_SPICY_TESTNET_CHAIN_ID = '0x15f92'; // 88882 in hexadecimal

interface UserState {
  walletAddress: string | null;
  isWalletConnected: boolean;
  superfanScore: number;
  fanLevel: string;
  fandomTraits: string;
  generatedBadgeArtwork: string | null;
  generatedQuote: string | null;
  aiSuggestions: string[];
  isLoadingScore: boolean;
  isLoadingAiArtwork: boolean;
  isLoadingAiQuote: boolean;
  isLoadingAiSuggestions: boolean;
  nftsHeld: number;
  ritualsCompleted: number;
}

interface UserActions {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setFandomTraits: (traits: string) => void;
  fetchGeneratedBadgeArtwork: () => Promise<void>;
  fetchGeneratedQuote: (fanActivity: string) => Promise<void>;
  fetchAiSuggestions: () => Promise<void>;
  updateScoreOnAction: (actionType: 'complete_ritual' | 'acquire_nft') => Promise<void>;
}

const initialState: UserState = {
  walletAddress: null,
  isWalletConnected: false,
  superfanScore: 0,
  fanLevel: "Rookie",
  fandomTraits: "Loves European football, collects vintage jerseys, travels for away matches.",
  generatedBadgeArtwork: null,
  generatedQuote: null,
  aiSuggestions: [],
  isLoadingScore: false,
  isLoadingAiArtwork: false,
  isLoadingAiQuote: false,
  isLoadingAiSuggestions: false,
  nftsHeld: 0,
  ritualsCompleted: 0,
};

const UserContext = createContext<(UserState & UserActions) | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UserState>(initialState);
  const { toast } = useToast();

  const calculateFanLevel = (score: number): string => {
    if (score < 300) return "Rookie";
    if (score < 700) return "Pro";
    return "Legend";
  };

  const fetchScoreForWallet = useCallback(async (address: string) => {
    setState(prevState => ({ ...prevState, isLoadingScore: true }));
    try {
      const response = await fetch(`/api/score?walletAddress=${address}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch score');
      }
      const data = await response.json();
      setState(prevState => ({
        ...prevState,
        superfanScore: data.score,
        fanLevel: calculateFanLevel(data.score),
        nftsHeld: data.nftsHeld || 0,
        ritualsCompleted: data.ritualsCompleted || 0,
        isLoadingScore: false,
      }));
    } catch (error) {
      console.error("Error fetching score:", error);
      toast({ variant: "destructive", title: "Score Fetch Failed", description: (error as Error).message });
      setState(prevState => ({ ...prevState, isLoadingScore: false, superfanScore: 0, fanLevel: "Rookie" }));
    }
  }, [toast]);

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      toast({ title: "Wallet Disconnected", description: "Your wallet has been disconnected." });
      disconnectWallet();
    } else {
      const newAddress = accounts[0];
      setState(prevState => ({
        ...prevState,
        walletAddress: newAddress,
        isWalletConnected: true,
      }));
      toast({ title: "Account Switched", description: `Connected to ${newAddress.substring(0, 6)}...${newAddress.substring(newAddress.length - 4)}` });
      await fetchScoreForWallet(newAddress);
    }
  }, [fetchScoreForWallet, toast]);

  const handleChainChanged = useCallback((chainId: string) => {
    if (chainId.toLowerCase() !== CHILIZ_SPICY_TESTNET_CHAIN_ID) {
      toast({
        variant: "destructive",
        title: "Wrong Network",
        description: "Please switch to the Chiliz Spicy Testnet in MetaMask.",
        duration: 5000,
      });
      // Optionally disconnect or prevent further actions
       setState(prevState => ({ ...prevState, isWalletConnected: false, walletAddress: null, superfanScore: 0, fanLevel: "Rookie"}));
    } else {
      toast({ title: "Network Correct", description: "Connected to Chiliz Spicy Testnet." });
      // If previously disconnected due to wrong network, try to reconnect or re-verify
      if (state.walletAddress) { // Attempt to re-fetch score if an address was known
         fetchScoreForWallet(state.walletAddress);
         setState(prevState => ({ ...prevState, isWalletConnected: true}));
      }
    }
  }, [toast, fetchScoreForWallet, state.walletAddress]);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check initial chain ID if already connected (e.g. on page load)
      // This part is tricky as 'ethereum.isConnected()' doesn't mean app is connected.
      // We rely on connectWallet to establish the app's connected state.

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);


  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({ variant: "destructive", title: "MetaMask Not Found", description: "Please install MetaMask to connect your wallet." });
      return;
    }

    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== CHILIZ_SPICY_TESTNET_CHAIN_ID) {
        toast({
          variant: "destructive",
          title: "Wrong Network",
          description: "Please switch to Chiliz Spicy Testnet in MetaMask first.",
          duration: 5000,
        });
        // Try to switch network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHILIZ_SPICY_TESTNET_CHAIN_ID }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: CHILIZ_SPICY_TESTNET_CHAIN_ID,
                    chainName: 'Chiliz Spicy Testnet',
                    nativeCurrency: {
                      name: 'CHZ',
                      symbol: 'CHZ',
                      decimals: 18,
                    },
                    rpcUrls: ['https://spicy-rpc.chiliz.com/'],
                    blockExplorerUrls: ['https://spicy-explorer.chiliz.com/'],
                  },
                ],
              });
            } catch (addError) {
              toast({ variant: "destructive", title: "Network Setup Failed", description: "Could not add Chiliz Spicy Testnet to MetaMask." });
              return;
            }
          } else {
            toast({ variant: "destructive", title: "Network Switch Failed", description: "Could not switch to Chiliz Spicy Testnet." });
            return;
          }
        }
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts.length > 0) {
        const address = accounts[0];
        setState(prevState => ({
          ...prevState,
          isWalletConnected: true,
          walletAddress: address,
        }));
        toast({ title: "Wallet Connected", description: `Address: ${address.substring(0, 6)}...${address.substring(address.length - 4)}` });
        await fetchScoreForWallet(address);
      } else {
         toast({ variant: "destructive", title: "Connection Failed", description: "No accounts found. Please check MetaMask."});
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) { // User rejected request
        toast({ variant: "destructive", title: "Connection Rejected", description: "You rejected the wallet connection request." });
      } else {
        toast({ variant: "destructive", title: "Connection Failed", description: error.message || "An unexpected error occurred." });
      }
      setState(prevState => ({ ...prevState, isWalletConnected: false, walletAddress: null }));
    }
  };

  const disconnectWallet = () => {
    // No direct "disconnect" method for window.ethereum, so we reset app state
    setState(initialState);
    toast({ title: "Wallet Disconnected" });
  };
  
  const updateScoreOnAction = async (actionType: 'complete_ritual' | 'acquire_nft') => {
    if (!state.walletAddress) {
      toast({ variant: "destructive", title: "Error", description: "Wallet not connected." });
      return;
    }
    setState(prevState => ({ ...prevState, isLoadingScore: true }));
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: state.walletAddress, action: actionType }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update score');
      }
      const data = await response.json();
      setState(prevState => ({
        ...prevState,
        superfanScore: data.score,
        fanLevel: calculateFanLevel(data.score),
        nftsHeld: data.nftsHeld !== undefined ? data.nftsHeld : prevState.nftsHeld,
        ritualsCompleted: data.ritualsCompleted !== undefined ? data.ritualsCompleted : prevState.ritualsCompleted,
        isLoadingScore: false,
      }));
      toast({ title: "Score Updated!", description: data.message });
    } catch (error) {
      console.error("Error updating score:", error);
      toast({ variant: "destructive", title: "Score Update Failed", description: (error as Error).message });
      setState(prevState => ({ ...prevState, isLoadingScore: false }));
    }
  };

  const setFandomTraits = (traits: string) => {
    setState(prevState => ({ ...prevState, fandomTraits: traits }));
  };

  const fetchGeneratedBadgeArtwork = async () => {
    if (!state.fandomTraits) {
      toast({ variant: "destructive", title: "Error", description: "Please set your fandom traits first." });
      return;
    }
    if (!state.isWalletConnected) {
      toast({ variant: "destructive", title: "Error", description: "Please connect your wallet first." });
      return;
    }
    setState(prevState => ({ ...prevState, isLoadingAiArtwork: true }));
    try {
      const result = await aiGenerateBadgeArtwork({ fandomTraits: state.fandomTraits });
      setState(prevState => ({ ...prevState, generatedBadgeArtwork: result.badgeArtwork, isLoadingAiArtwork: false }));
      toast({ title: "Badge Artwork Generated!", description: "Your unique fan badge is ready." });
    } catch (error) {
      console.error("Error generating badge artwork:", error);
      setState(prevState => ({ ...prevState, isLoadingAiArtwork: false }));
      toast({ variant: "destructive", title: "Artwork Generation Failed", description: "Could not generate badge artwork. Please try again." });
    }
  };

  const fetchGeneratedQuote = async (fanActivity: string) => {
    if (!fanActivity) {
      toast({ variant: "destructive", title: "Error", description: "Please describe your fan activity." });
      return;
    }
     if (!state.isWalletConnected) {
      toast({ variant: "destructive", title: "Error", description: "Please connect your wallet first." });
      return;
    }
    setState(prevState => ({ ...prevState, isLoadingAiQuote: true }));
    try {
      const result = await generateFanQuote({ fanActivity });
      setState(prevState => ({ ...prevState, generatedQuote: result.fanQuote, isLoadingAiQuote: false }));
      toast({ title: "Fan Quote Generated!", description: "Your personalized fan quote is here." });
    } catch (error) {
      console.error("Error generating fan quote:", error);
      setState(prevState => ({ ...prevState, isLoadingAiQuote: false }));
      toast({ variant: "destructive", title: "Quote Generation Failed", description: "Could not generate fan quote. Please try again." });
    }
  };

  const fetchAiSuggestions = async () => {
    if (!state.isWalletConnected || !state.walletAddress) {
       toast({ variant: "destructive", title: "Error", description: "Please connect your wallet first." });
      return;
    }
    setState(prevState => ({ ...prevState, isLoadingAiSuggestions: true }));
    try {
      // Pass the current nftsHeld and ritualsCompleted to the AI suggestions flow
      const result = await improveFanScoreSuggestions({ 
        superfanScore: state.superfanScore, 
        walletAddress: state.walletAddress
        // We could add nftsHeld: state.nftsHeld, ritualsCompleted: state.ritualsCompleted here
        // if the Genkit flow is updated to use them for more tailored suggestions.
      });
      setState(prevState => ({ ...prevState, aiSuggestions: result.suggestions, isLoadingAiSuggestions: false }));
      // No toast here, as suggestions appear in the chat.
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      setState(prevState => ({ ...prevState, isLoadingAiSuggestions: false, aiSuggestions: ["Failed to load suggestions. Please try again later."] }));
      toast({ variant: "destructive", title: "Suggestion Fetch Failed", description: "Could not get AI suggestions. Please check console." });
    }
  };

  return (
    <UserContext.Provider value={{ ...state, connectWallet, disconnectWallet, setFandomTraits, fetchGeneratedBadgeArtwork, fetchGeneratedQuote, fetchAiSuggestions, updateScoreOnAction }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
