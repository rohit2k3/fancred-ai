// src/contexts/UserContext.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { aiGenerateBadgeArtwork, type AiGenerateBadgeArtworkInput } from '@/ai/flows/ai-generate-badge-artwork';
import { generateFanQuote, type MintYourMomentInput } from '@/ai/flows/mint-your-moment';
import { improveFanScoreSuggestions, type ImproveFanScoreSuggestionsInput } from '@/ai/flows/improve-fan-score-suggestions';
import { generateFanAnalysis, type GenerateFanAnalysisInput, type GenerateFanAnalysisOutput } from '@/ai/flows/generate-fan-analysis-flow';
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
  fanAnalysis: string | null;
  isLoadingScore: boolean;
  isLoadingAiArtwork: boolean;
  isLoadingAiQuote: boolean;
  isLoadingAiSuggestions: boolean;
  isLoadingFanAnalysis: boolean;
  nftsHeld: number;
  ritualsCompleted: number;
  chzBalance: number;
}

interface UserActions {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setFandomTraits: (traits: string) => void;
  fetchGeneratedBadgeArtwork: () => Promise<void>;
  fetchGeneratedQuote: (fanActivity: string) => Promise<void>;
  fetchAiSuggestions: () => Promise<void>;
  fetchFanAnalysis: () => Promise<void>;
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
  fanAnalysis: null,
  isLoadingScore: false,
  isLoadingAiArtwork: false,
  isLoadingAiQuote: false,
  isLoadingAiSuggestions: false,
  isLoadingFanAnalysis: false,
  nftsHeld: 0,
  ritualsCompleted: 0,
  chzBalance: 0,
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
        chzBalance: data.chzBalance || 0,
        isLoadingScore: false,
      }));
    } catch (error) {
      console.error("Error fetching score:", error);
      toast({ variant: "destructive", title: "Score Fetch Failed", description: (error as Error).message });
      setState(prevState => ({ ...prevState, isLoadingScore: false, superfanScore: 0, fanLevel: "Rookie", nftsHeld: 0, ritualsCompleted: 0, chzBalance: 0 }));
    }
  }, [toast]);

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      toast({ title: "Wallet Disconnected", description: "Your wallet has been disconnected." });
      disconnectWallet(); // Use the existing disconnectWallet function
    } else {
      const newAddress = accounts[0];
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== CHILIZ_SPICY_TESTNET_CHAIN_ID) {
        setState(prevState => ({
            ...prevState,
            walletAddress: newAddress, // Update address but mark as not fully connected due to network
            isWalletConnected: false, // Or a new state e.g. isNetworkCorrect: false
        }));
        toast({
            variant: "destructive",
            title: "Wrong Network After Account Switch",
            description: "Please switch to the Chiliz Spicy Testnet in MetaMask.",
            duration: 5000,
        });
        return; // Stop further processing until network is correct
      }

      setState(prevState => ({
        ...prevState,
        walletAddress: newAddress,
        isWalletConnected: true,
      }));
      toast({ title: "Account Switched", description: `Connected to ${newAddress.substring(0, 6)}...${newAddress.substring(newAddress.length - 4)}` });
      await fetchScoreForWallet(newAddress);
    }
  }, [fetchScoreForWallet, toast]);

  const handleChainChanged = useCallback(async (chainId: string) => {
    if (chainId.toLowerCase() !== CHILIZ_SPICY_TESTNET_CHAIN_ID) {
      toast({
        variant: "destructive",
        title: "Wrong Network",
        description: "Please switch to the Chiliz Spicy Testnet in MetaMask.",
        duration: 5000,
      });
       setState(prevState => ({ ...prevState, isWalletConnected: false, superfanScore: 0, fanLevel: "Rookie", fanAnalysis: null, aiSuggestions: [] })); // Reset key data if network is wrong
    } else {
      toast({ title: "Network Correct", description: "Connected to Chiliz Spicy Testnet." });
      if (state.walletAddress) { 
         setState(prevState => ({ ...prevState, isWalletConnected: true}));
         await fetchScoreForWallet(state.walletAddress); // Re-fetch score now that network is correct
      } else {
        // If no wallet address was set (e.g., initial load on wrong network), prompt to connect
        connectWallet();
      }
    }
  }, [toast, fetchScoreForWallet, state.walletAddress]); // Added connectWallet here

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
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
      if (currentChainId.toLowerCase() !== CHILIZ_SPICY_TESTNET_CHAIN_ID) {
        toast({
          variant: "destructive",
          title: "Wrong Network",
          description: "Attempting to switch to Chiliz Spicy Testnet...",
          duration: 3000,
        });
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHILIZ_SPICY_TESTNET_CHAIN_ID }],
          });
          // After successful switch, chainChanged event should handle the rest
        } catch (switchError: any) {
          if (switchError.code === 4902) { // Chain not added
            toast({ title: "Network Not Added", description: "Attempting to add Chiliz Spicy Testnet..."});
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: CHILIZ_SPICY_TESTNET_CHAIN_ID,
                    chainName: 'Chiliz Spicy Testnet',
                    nativeCurrency: { name: 'CHZ', symbol: 'CHZ', decimals: 18 },
                    rpcUrls: ['https://spicy-rpc.chiliz.com/'],
                    blockExplorerUrls: ['https://spicy-explorer.chiliz.com/'],
                  },
                ],
              });
               // After successful add, chainChanged event should handle the rest, or re-request accounts
            } catch (addError) {
              toast({ variant: "destructive", title: "Network Add Failed", description: "Could not add Chiliz Spicy Testnet." });
              return;
            }
          } else {
            toast({ variant: "destructive", title: "Network Switch Failed", description: "Could not switch to Chiliz Spicy Testnet. Please do it manually." });
            return;
          }
        }
        // At this point, if switch/add was successful, chainChanged should fire.
        // We might need to re-request accounts if not automatically handled.
        // For now, let's assume chainChanged takes over or user re-clicks.
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts.length > 0) {
        const address = accounts[0];
         // Verify chain ID again after requesting accounts, as user might have switched during prompt
        const finalChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (finalChainId.toLowerCase() !== CHILIZ_SPICY_TESTNET_CHAIN_ID) {
            toast({ variant: "destructive", title: "Wrong Network", description: "Please ensure you are on the Chiliz Spicy Testnet."});
            setState(prevState => ({ ...prevState, isWalletConnected: false, walletAddress: address })); // Store address but mark as not fully connected
            return;
        }

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
    setState(initialState);
    toast({ title: "Wallet Disconnected" });
  };
  
  const updateScoreOnAction = async (actionType: 'complete_ritual' | 'acquire_nft') => {
    if (!state.walletAddress || !state.isWalletConnected) {
      toast({ variant: "destructive", title: "Action Failed", description: "Wallet not connected or on wrong network." });
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
        chzBalance: data.chzBalance !== undefined ? data.chzBalance : prevState.chzBalance,
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
    if (!state.isWalletConnected || !state.walletAddress) {
      toast({ variant: "destructive", title: "Artwork Failed", description: "Please connect your wallet first." });
      return;
    }
    if (!state.fandomTraits.trim()) {
      toast({ variant: "destructive", title: "Artwork Failed", description: "Please set your fandom traits first." });
      return;
    }
    // Example score threshold
    if (state.superfanScore < 100) {
        toast({ variant: "destructive", title: "Artwork Denied", description: `Score too low. Need 100, have ${state.superfanScore}.` });
        return;
    }

    setState(prevState => ({ ...prevState, isLoadingAiArtwork: true, generatedBadgeArtwork: null })); // Reset previous artwork
    try {
      const input: AiGenerateBadgeArtworkInput = { fandomTraits: state.fandomTraits };
      const result = await aiGenerateBadgeArtwork(input);
      setState(prevState => ({ ...prevState, generatedBadgeArtwork: result.badgeArtwork, isLoadingAiArtwork: false }));
      toast({ title: "Badge Artwork Generated!", description: "Your unique fan badge is ready." });
    } catch (error) {
      console.error("Error generating badge artwork:", error);
      setState(prevState => ({ ...prevState, isLoadingAiArtwork: false }));
      toast({ variant: "destructive", title: "Artwork Generation Failed", description: "Could not generate badge artwork. Please try again." });
    }
  };

  const fetchGeneratedQuote = async (fanActivity: string) => {
    if (!state.isWalletConnected || !state.walletAddress) {
      toast({ variant: "destructive", title: "Quote Failed", description: "Please connect your wallet first." });
      return;
    }
    if (!fanActivity.trim()) {
      toast({ variant: "destructive", title: "Quote Failed", description: "Please describe your fan activity." });
      return;
    }
    setState(prevState => ({ ...prevState, isLoadingAiQuote: true, generatedQuote: null }));
    try {
      const input: MintYourMomentInput = { fanActivity };
      const result = await generateFanQuote(input);
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
       toast({ variant: "destructive", title: "Suggestions Failed", description: "Please connect your wallet first." });
      return;
    }
    setState(prevState => ({ ...prevState, isLoadingAiSuggestions: true, aiSuggestions: [] }));
    try {
      const input: ImproveFanScoreSuggestionsInput = { 
        superfanScore: state.superfanScore, 
        walletAddress: state.walletAddress
      };
      const result = await improveFanScoreSuggestions(input);
      setState(prevState => ({ ...prevState, aiSuggestions: result.suggestions, isLoadingAiSuggestions: false }));
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      const errorMsg = "Failed to load suggestions. Please try again.";
      setState(prevState => ({ ...prevState, isLoadingAiSuggestions: false, aiSuggestions: [errorMsg] }));
      toast({ variant: "destructive", title: "Suggestion Fetch Failed", description: (error as Error).message || errorMsg });
    }
  };

  const fetchFanAnalysis = async () => {
    if (!state.isWalletConnected || !state.walletAddress) {
      toast({ variant: "destructive", title: "Analysis Failed", description: "Please connect your wallet first." });
      return;
    }
     if (!state.fandomTraits.trim()) {
      toast({ variant: "destructive", title: "Analysis Failed", description: "Please define your fandom traits for a better analysis." });
      // return; // Or allow to proceed with a more generic analysis
    }
    setState(prevState => ({ ...prevState, isLoadingFanAnalysis: true, fanAnalysis: null }));
    try {
      const input: GenerateFanAnalysisInput = {
        superfanScore: state.superfanScore,
        fanLevel: state.fanLevel,
        fandomTraits: state.fandomTraits,
        walletAddress: state.walletAddress,
        numNftsHeld: state.nftsHeld,
        numRitualsParticipated: state.ritualsCompleted,
      };
      const result: GenerateFanAnalysisOutput = await generateFanAnalysis(input);
      setState(prevState => ({ ...prevState, fanAnalysis: result.analysisSummary, isLoadingFanAnalysis: false }));
       // No toast here, as analysis appears in the chat or a dedicated section.
    } catch (error) {
      console.error("Error fetching fan analysis:", error);
      const errorMsg = "Failed to generate fan analysis. Please try again.";
      setState(prevState => ({ ...prevState, isLoadingFanAnalysis: false, fanAnalysis: errorMsg }));
      toast({ variant: "destructive", title: "Analysis Failed", description: (error as Error).message || errorMsg });
    }
  };


  return (
    <UserContext.Provider value={{ 
        ...state, 
        connectWallet, 
        disconnectWallet, 
        setFandomTraits, 
        fetchGeneratedBadgeArtwork, 
        fetchGeneratedQuote, 
        fetchAiSuggestions,
        fetchFanAnalysis, 
        updateScoreOnAction 
    }}>
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
