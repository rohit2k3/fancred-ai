// src/contexts/UserContext.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { aiGenerateBadgeArtwork } from '@/ai/flows/ai-generate-badge-artwork';
import { generateFanQuote } from '@/ai/flows/mint-your-moment';
import { improveFanScoreSuggestions } from '@/ai/flows/improve-fan-score-suggestions';
import { useToast } from "@/hooks/use-toast";

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
  connectWallet: () => void;
  disconnectWallet: () => void;
  setFandomTraits: (traits: string) => void;
  fetchGeneratedBadgeArtwork: () => Promise<void>;
  fetchGeneratedQuote: (fanActivity: string) => Promise<void>;
  fetchAiSuggestions: () => Promise<void>;
  updateScoreOnAction: (actionType: 'complete_ritual' | 'acquire_nft') => Promise<void>; // For mock updates
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
        throw new Error('Failed to fetch score');
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
      toast({ variant: "destructive", title: "Score Fetch Failed", description: "Could not retrieve your Superfan Score." });
      setState(prevState => ({ ...prevState, isLoadingScore: false, superfanScore: 0, fanLevel: "Rookie" }));
    }
  }, [toast]);


  const connectWallet = async () => {
    const mockAddress = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setState(prevState => ({
      ...prevState,
      isWalletConnected: true,
      walletAddress: mockAddress,
    }));
    toast({ title: "Wallet Connected", description: `Address: ${mockAddress.substring(0,6)}...${mockAddress.substring(mockAddress.length-4)}` });
    await fetchScoreForWallet(mockAddress);
  };

  const disconnectWallet = () => {
    setState(initialState); // Reset to initial state
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
        throw new Error('Failed to update score');
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
      toast({ variant: "destructive", title: "Score Update Failed", description: "Could not update your score." });
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
      const result = await improveFanScoreSuggestions({ superfanScore: state.superfanScore, walletAddress: state.walletAddress });
      setState(prevState => ({ ...prevState, aiSuggestions: result.suggestions, isLoadingAiSuggestions: false }));
      toast({ title: "AI Suggestions Ready", description: "Check out how to boost your FanCred!" });
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      setState(prevState => ({ ...prevState, isLoadingAiSuggestions: false, aiSuggestions: ["Failed to load suggestions. Please try again."] }));
      toast({ variant: "destructive", title: "Suggestion Fetch Failed", description: "Could not get AI suggestions. Please try again." });
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
