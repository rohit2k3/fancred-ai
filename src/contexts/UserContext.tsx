
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
  isConnecting: boolean; 
  nftsHeld: number;
  ritualsCompleted: number;
  chzBalance: number;
  isOnCorrectNetwork: boolean;
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
  switchToCorrectNetwork: () => Promise<void>;
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
  isOnCorrectNetwork: false,
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

  const resetUserSessionData = useCallback(() => {
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
      isLoadingScore: false,
      isLoadingAiArtwork: false,
      isLoadingAiQuote: false,
      isLoadingAiSuggestions: false,
      isLoadingFanAnalysis: false,
    }));
  }, []);

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
  
  useEffect(() => {
    const isActuallyConnected = connectionStatus === 'connected' && !!thirdwebAddress;
    const correctNetwork = isActuallyConnected && thirdwebChainId === ChilizSpicy.chainId;

    setState(prevState => ({
      ...prevState,
      isWalletConnected: isActuallyConnected,
      walletAddress: thirdwebAddress || null,
      isOnCorrectNetwork: correctNetwork,
      isConnecting: connectionStatus === 'connecting', // Reflect thirdweb's connecting state
    }));

    if (isActuallyConnected) {
      if (correctNetwork) {
        fetchScoreForWallet(thirdwebAddress!);
      } else {
        resetUserSessionData(); // Reset app data if on wrong network
        toast({ variant: "destructive", title: "Wrong Network", description: "Please switch to Chiliz Spicy Testnet.", duration: 7000 });
      }
    } else {
      resetUserSessionData(); // Reset app data if not connected
      if (connectionStatus === 'disconnected' && state.walletAddress) { // Only show disconnect toast if previously connected
        // toast({ title: "Wallet Disconnected" }); // This might be too noisy if it shows on initial load.
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thirdwebAddress, connectionStatus, thirdwebChainId, fetchScoreForWallet, resetUserSessionData]);


  const switchToCorrectNetwork = async () => {
    if (!switchChain) {
      toast({variant: "destructive", title: "Error", description: "Network switching feature not available."});
      return;
    }
    setState(prevState => ({ ...prevState, isConnecting: true }));
    try {
      await switchChain(ChilizSpicy.chainId);
      toast({title: "Network Switched", description: "Successfully switched to Chiliz Spicy Testnet."});
      // The useEffect above will handle fetching score once chainId updates
    } catch (error: any) {
      console.error("Failed to switch network:", error);
      if (error.code === 4001) { // User rejected the request
        toast({variant: "destructive", title: "Network Switch Cancelled", description: "You cancelled the network switch request."});
      } else {
        toast({variant: "destructive", title: "Network Switch Failed", description: "Could not switch to Chiliz Spicy. Please try from your wallet."});
      }
    } finally {
      setState(prevState => ({ ...prevState, isConnecting: false }));
    }
  };

  const connectWallet = async () => {
    if (state.isConnecting || connectionStatus === 'connecting') {
        toast({ title: "Connection In Progress", description: "Please complete any pending wallet actions."});
        return;
    }
    setState(prevState => ({ ...prevState, isConnecting: true }));

    try {
      const connectedWallet = await connectWithMetamask({
         async onConnected(details) {
          // This callback might be too early for chainId to be stable from thirdweb hooks,
          // so we rely on the useEffect for definitive chain check and score fetch.
          console.log("Thirdweb onConnected details:", details);
        }
      });

      if (!connectedWallet) {
        throw new Error("Connection failed or was cancelled by the user.");
      }
      
      // At this point, thirdweb's hooks (useAddress, useChainId, useConnectionStatus)
      // will update, and the main useEffect will handle checking the network
      // and fetching the score if appropriate.

    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (error.message?.includes("User rejected the request") || error.code === 4001) {
        toast({ variant: "destructive", title: "Connection Cancelled", description: "You cancelled the wallet connection request." });
      } else if (error.message?.includes("Request of type 'wallet_requestPermissions' already pending")) {
        toast({ variant: "destructive", title: "Request Pending", description: "Please complete the existing MetaMask request." });
      } else if (error.message?.includes("MetaMask not available")) {
        toast({ variant: "destructive", title: "MetaMask Not Found", description: "Please install MetaMask to connect your wallet." });
      }
      else {
        toast({ variant: "destructive", title: "Connection Failed", description: (error as Error).message || "An unexpected error occurred." });
      }
      // Ensure any app-level state is reset if connection fails partway
      setState(prevState => ({ ...prevState, isWalletConnected: false, walletAddress: null, isOnCorrectNetwork: false }));
    } finally {
      // The isConnecting state is largely managed by thirdweb's connectionStatus now,
      // but we set it false here to ensure our UI enables buttons if thirdweb's state doesn't update quickly enough.
      setState(prevState => ({ ...prevState, isConnecting: false }));
    }
  };

  const disconnectWallet = async () => {
    if (state.isConnecting) return;
    setState(prevState => ({ ...prevState, isConnecting: true }));
    try {
      await disconnectThirdwebWallet();
      toast({ title: "Wallet Disconnected" });
      // State reset is handled by the useEffect watching connectionStatus
    } catch (error) {
        console.error("Error disconnecting wallet:", error);
        toast({ variant: "destructive", title: "Disconnection Failed", description: "Could not disconnect wallet." });
    } finally {
        setState(prevState => ({ ...prevState, isConnecting: false }));
    }
  };
  
  const updateScoreOnAction = async (actionType: 'complete_ritual' | 'acquire_nft') => {
    if (!state.walletAddress || !state.isWalletConnected || !state.isOnCorrectNetwork) {
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
    if (!state.isWalletConnected || !state.walletAddress || !state.isOnCorrectNetwork) {
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
     if (!state.isWalletConnected || !state.walletAddress || !state.isOnCorrectNetwork) {
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
    if (!state.isWalletConnected || !state.walletAddress || !state.isOnCorrectNetwork) {
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
    if (!state.isWalletConnected || !state.walletAddress || !state.isOnCorrectNetwork) {
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
        updateScoreOnAction,
        switchToCorrectNetwork,
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

