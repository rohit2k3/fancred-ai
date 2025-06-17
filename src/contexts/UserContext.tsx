// src/contexts/UserContext.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  useAddress, 
  useConnectionStatus, 
  useChainId, 
  useSwitchChain, 
  useMetamask,
  useDisconnect
} from '@thirdweb-dev/react';
import { ChilizSpicy } from '@thirdweb-dev/chains';
import { aiGenerateBadgeArtwork, type AiGenerateBadgeArtworkInput } from '@/ai/flows/ai-generate-badge-artwork';
import { generateFanQuote, type MintYourMomentInput } from '@/ai/flows/mint-your-moment';
import { improveFanScoreSuggestions, type ImproveFanScoreSuggestionsInput } from '@/ai/flows/improve-fan-score-suggestions';
import { generateFanAnalysis, type GenerateFanAnalysisInput, type GenerateFanAnalysisOutput } from '@/ai/flows/generate-fan-analysis-flow';
import { useToast } from "@/hooks/use-toast";

interface UserState {
  walletAddress: string | null;
  isWalletConnected: boolean; // Derived from Thirdweb's connectionStatus
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
  isConnecting: boolean; // For our app-specific async operations post-connection or during connection attempts
  nftsHeld: number;
  ritualsCompleted: number;
  chzBalance: number;
}

interface UserActions {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
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
  isConnecting: false,
  nftsHeld: 0,
  ritualsCompleted: 0,
  chzBalance: 0,
};

const UserContext = createContext<(UserState & UserActions) | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UserState>(initialState);
  const { toast } = useToast();

  const thirdwebAddress = useAddress();
  const connectionStatus = useConnectionStatus();
  const thirdwebChainId = useChainId();
  const switchChain = useSwitchChain();
  const connectWithMetamask = useMetamask();
  const disconnectThirdwebWallet = useDisconnect();

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
  
  // Update local state based on Thirdweb's connection status and address
  useEffect(() => {
    const isConnected = connectionStatus === 'connected' && !!thirdwebAddress;
    const currentAddress = thirdwebAddress || null;

    setState(prevState => ({
      ...prevState,
      isWalletConnected: isConnected,
      walletAddress: currentAddress,
    }));

    if (isConnected && currentAddress) {
        if (thirdwebChainId !== ChilizSpicy.chainId) {
            toast({ variant: "destructive", title: "Wrong Network", description: "Please switch to Chiliz Spicy Testnet.", duration: 5000 });
             setState(prevState => ({ ...prevState, isWalletConnected: false, superfanScore: 0, fanLevel: "Rookie"})); // Mark as not fully usable
        } else {
            fetchScoreForWallet(currentAddress);
        }
    } else if (connectionStatus === 'disconnected') {
      // Reset app-specific user data when Thirdweb reports disconnection
      setState(prevState => ({
        ...prevState,
        superfanScore: 0,
        fanLevel: "Rookie",
        generatedBadgeArtwork: null,
        generatedQuote: null,
        aiSuggestions: [],
        fanAnalysis: null,
        nftsHeld: 0,
        ritualsCompleted: 0,
        chzBalance: 0,
      }));
    }
  }, [thirdwebAddress, connectionStatus, thirdwebChainId, fetchScoreForWallet, toast]);


  const connectWallet = async () => {
    if (state.isConnecting || connectionStatus === 'connecting') return;
    setState(prevState => ({ ...prevState, isConnecting: true }));

    try {
      if (connectionStatus !== 'connected') {
        await connectWithMetamask(); 
        // Connection status and address will be updated by the useEffect above
        // We need to wait for the connection to establish and then check the chain.
        // Thirdweb's connect hooks usually handle the modal.
      }
      
      // After attempting connection, check chain (useEffect will also do this, but explicit check can be good)
      // This part might be redundant if useEffect handles it well.
      const currentAddress = useAddress(); // get fresh address
      const currentChain = useChainId(); // get fresh chain
      
      if (currentAddress && currentChain) {
        if (currentChain !== ChilizSpicy.chainId) {
          toast({ title: "Network Switch Required", description: "Attempting to switch to Chiliz Spicy Testnet..." });
          try {
            await switchChain(ChilizSpicy.chainId);
             toast({ title: "Network Switched", description: "Successfully switched to Chiliz Spicy Testnet." });
          } catch (error) {
            console.error("Error switching chain:", error);
            toast({ variant: "destructive", title: "Network Switch Failed", description: "Could not switch to Chiliz Spicy Testnet. Please do it manually." });
            setState(prevState => ({ ...prevState, isConnecting: false }));
            return;
          }
        }
        // Score fetching will be handled by the useEffect watching thirdwebAddress and connectionStatus
      } else if(connectionStatus === 'connected' && !currentAddress) {
        // This case should ideally not happen if thirdweb connection is successful
        toast({ variant: "destructive", title: "Connection Error", description: "Connected but no address found." });
      }

    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({ variant: "destructive", title: "Connection Failed", description: (error as Error).message || "An unexpected error occurred." });
    } finally {
      setState(prevState => ({ ...prevState, isConnecting: false }));
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnectThirdwebWallet();
      toast({ title: "Wallet Disconnected" });
      // State reset is handled by the useEffect watching connectionStatus
    } catch (error) {
        console.error("Error disconnecting wallet:", error);
        toast({ variant: "destructive", title: "Disconnection Failed", description: "Could not disconnect wallet." });
    }
  };
  
  const updateScoreOnAction = async (actionType: 'complete_ritual' | 'acquire_nft') => {
    if (!state.walletAddress || !state.isWalletConnected || thirdwebChainId !== ChilizSpicy.chainId) {
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
    if (!state.isWalletConnected || !state.walletAddress || thirdwebChainId !== ChilizSpicy.chainId) {
      toast({ variant: "destructive", title: "Artwork Failed", description: "Connect to Chiliz Spicy Testnet first." });
      return;
    }
    if (!state.fandomTraits.trim()) {
      toast({ variant: "destructive", title: "Artwork Failed", description: "Please set your fandom traits first." });
      return;
    }
    if (state.superfanScore < 100) {
        toast({ variant: "destructive", title: "Artwork Denied", description: `Score too low. Need 100, have ${state.superfanScore}.` });
        return;
    }

    setState(prevState => ({ ...prevState, isLoadingAiArtwork: true, generatedBadgeArtwork: null }));
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
     if (!state.isWalletConnected || !state.walletAddress || thirdwebChainId !== ChilizSpicy.chainId) {
      toast({ variant: "destructive", title: "Quote Failed", description: "Connect to Chiliz Spicy Testnet first." });
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
    if (!state.isWalletConnected || !state.walletAddress || thirdwebChainId !== ChilizSpicy.chainId) {
       toast({ variant: "destructive", title: "Suggestions Failed", description: "Connect to Chiliz Spicy Testnet first." });
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
    if (!state.isWalletConnected || !state.walletAddress || thirdwebChainId !== ChilizSpicy.chainId) {
      toast({ variant: "destructive", title: "Analysis Failed", description: "Connect to Chiliz Spicy Testnet first." });
      return;
    }
     if (!state.fandomTraits.trim()) {
      toast({ variant: "destructive", title: "Analysis Failed", description: "Please define your fandom traits for a better analysis." });
       // return; // Decide if this should block or proceed with partial info
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
