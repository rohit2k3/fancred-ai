"use client";

import type { ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  aiGenerateBadgeArtwork,
  type AiGenerateBadgeArtworkInput,
} from "@/ai/flows/ai-generate-badge-artwork";
import {
  generateFanQuote,
  type MintYourMomentInput,
} from "@/ai/flows/mint-your-moment";
import {
  improveFanScoreSuggestions,
  type ImproveFanScoreSuggestionsInput,
} from "@/ai/flows/improve-fan-score-suggestions";
import {
  generateFanAnalysis,
  type GenerateFanAnalysisInput,
  type GenerateFanAnalysisOutput,
} from "@/ai/flows/generate-fan-analysis-flow";
import { useToast } from "@/hooks/use-toast";
import {
  useActiveAccount,
  useActiveWalletConnectionStatus,
  useActiveWalletChain
} from "thirdweb/react";
import { chilizChainId } from "@/constant/contact";

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
  isOnCorrectNetwork:boolean;
}

interface UserActions {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  setFandomTraits: (traits: string) => void;
  fetchGeneratedBadgeArtwork: () => Promise<void>;
  fetchGeneratedQuote: (fanActivity: string) => Promise<void>;
  fetchAiSuggestions: () => Promise<void>;
  fetchFanAnalysis: () => Promise<void>;
  updateScoreOnAction: (
    actionType: "complete_ritual" | "acquire_nft"
  ) => Promise<void>;
}

const initialState: UserState = {
  walletAddress: null,
  isWalletConnected: false,
  superfanScore: 0,
  fanLevel: "Rookie",
  fandomTraits:
    "Loves European football, collects vintage jerseys, travels for away matches.",
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

const UserContext = createContext<(UserState & UserActions) | undefined>(
  undefined
);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UserState>(initialState);
  const { toast } = useToast();
  const status = useActiveWalletConnectionStatus();
  const activeAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();

  useEffect(() => {
    const handleStatusChange = async () => {
      const isConnecting = status === 'connecting';
      const isConnected = status === 'connected';
      const address = activeAccount?.address || null;
      const isChainCorrect = activeChain?.id === chilizChainId;
      
      setState(prevState => ({ ...prevState, isConnecting, isWalletConnected: isConnected, walletAddress: address, isOnCorrectNetwork: isChainCorrect }));

      if (isConnected && address && isChainCorrect) {
        await fetchScoreForWallet(address);
      } else if (isConnected && (!address || !isChainCorrect)) {
        // Connected, but wrong chain or no address, clear score info
        setState(prevState => ({ 
            ...prevState, 
            superfanScore: 0,
            fanLevel: "Rookie",
            nftsHeld: 0,
            ritualsCompleted: 0,
            chzBalance: 0,
        }));
      } else if (!isConnected && !isConnecting) {
        // Disconnected
        setState(initialState);
      }
    };

    handleStatusChange();
  }, [status, activeAccount, activeChain]);


  const calculateFanLevel = (score: number): string => {
    if (score < 300) return "Rookie";
    if (score < 700) return "Pro";
    return "Legend";
  };

  const fetchScoreForWallet = useCallback(
    async (address: string) => {
      if (!address) return;
      setState((prevState) => ({ ...prevState, isLoadingScore: true }));
      try {
        const response = await fetch(`/api/score?walletAddress=${address}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch score");
        }
        const data = await response.json();
        setState((prevState) => ({
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
        toast({
          variant: "destructive",
          title: "Score Fetch Failed",
          description: "Could not retrieve your on-chain data. Please try again later.",
        });
        setState((prevState) => ({
          ...prevState,
          isLoadingScore: false,
          superfanScore: 0,
          fanLevel: "Rookie",
          nftsHeld: 0,
          ritualsCompleted: 0,
          chzBalance: 0,
        }));
      }
    },
    [toast]
  );

  const connectWallet = async () => {
    // This function is now primarily handled by the Thirdweb ConnectButton
    // and the useEffect hook that listens to connection status changes.
    // Kept here for any potential manual trigger points.
    toast({ title: "Connecting...", description: "Please follow the prompts in your wallet." });
  };

  const disconnectWallet = async () => {
    // This is handled by the Thirdweb ConnectButton.
    // The state will reset via the useEffect hook.
    toast({
      title: "Wallet Disconnected",
      description: "You have successfully disconnected your wallet.",
    });
  };

  const updateScoreOnAction = async (
    actionType: "complete_ritual" | "acquire_nft"
  ) => {
    if (!state.walletAddress) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: "Wallet not connected.",
      });
      return;
    }
    // Since the API now fetches live on-chain data, we just need to re-fetch the score.
    // The `ritualsCompleted` part is mocked in the API and would need a database to be stateful.
    toast({
      title: "Action Recorded (Mock)",
      description: `Refreshing your score based on your latest on-chain data...`,
    });
    await fetchScoreForWallet(state.walletAddress);
  };

  const setFandomTraits = (traits: string) => {
    setState((prevState) => ({ ...prevState, fandomTraits: traits }));
  };

  const fetchGeneratedBadgeArtwork = async () => {
    if (!state.isWalletConnected || !state.walletAddress) {
      toast({
        variant: "destructive",
        title: "Artwork Failed",
        description: "Connect to Chiliz Spicy Testnet first.",
      });
      return;
    }
    if (!state.fandomTraits.trim()) {
      toast({
        variant: "destructive",
        title: "Artwork Failed",
        description: "Please set your fandom traits first.",
      });
      return;
    }
    if (state.superfanScore < 100) {
      toast({
        variant: "destructive",
        title: "Artwork Denied",
        description: `Score too low. Need 100, have ${state.superfanScore}.`,
      });
      return;
    }

    setState((prevState) => ({
      ...prevState,
      isLoadingAiArtwork: true,
      generatedBadgeArtwork: null,
    }));
    try {
      const input: AiGenerateBadgeArtworkInput = {
        fandomTraits: state.fandomTraits,
      };
      const result = await aiGenerateBadgeArtwork(input);
      setState((prevState) => ({
        ...prevState,
        generatedBadgeArtwork: result.badgeArtwork,
        isLoadingAiArtwork: false,
      }));
      toast({
        title: "Badge Artwork Generated!",
        description: "Your unique fan badge is ready.",
      });
    } catch (error) {
      console.error("Error generating badge artwork:", error);
      setState((prevState) => ({ ...prevState, isLoadingAiArtwork: false }));
      toast({
        variant: "destructive",
        title: "Artwork Generation Failed",
        description: "Could not generate badge artwork. Please try again.",
      });
    }
  };

  const fetchGeneratedQuote = async (fanActivity: string) => {
    if (!state.isWalletConnected || !state.walletAddress) {
      toast({
        variant: "destructive",
        title: "Quote Failed",
        description: "Connect to Chiliz Spicy Testnet first.",
      });
      return;
    }
    if (!fanActivity.trim()) {
      toast({
        variant: "destructive",
        title: "Quote Failed",
        description: "Please describe your fan activity.",
      });
      return;
    }
    setState((prevState) => ({
      ...prevState,
      isLoadingAiQuote: true,
      generatedQuote: null,
    }));
    try {
      const input: MintYourMomentInput = { fanActivity };
      const result = await generateFanQuote(input);
      setState((prevState) => ({
        ...prevState,
        generatedQuote: result.fanQuote,
        isLoadingAiQuote: false,
      }));
      toast({
        title: "Fan Quote Generated!",
        description: "Your personalized fan quote is here.",
      });
    } catch (error) {
      console.error("Error generating fan quote:", error);
      setState((prevState) => ({ ...prevState, isLoadingAiQuote: false }));
      toast({
        variant: "destructive",
        title: "Quote Generation Failed",
        description: "Could not generate fan quote. Please try again.",
      });
    }
  };

  const fetchAiSuggestions = async () => {
    if (!state.isWalletConnected || !state.walletAddress) {
      toast({
        variant: "destructive",
        title: "Suggestions Failed",
        description: "Connect to Chiliz Spicy Testnet first.",
      });
      return;
    }
    setState((prevState) => ({
      ...prevState,
      isLoadingAiSuggestions: true,
      aiSuggestions: [],
    }));
    try {
      const input: ImproveFanScoreSuggestionsInput = {
        superfanScore: state.superfanScore,
        walletAddress: state.walletAddress,
      };
      const result = await improveFanScoreSuggestions(input);
      setState((prevState) => ({
        ...prevState,
        aiSuggestions: result.suggestions,
        isLoadingAiSuggestions: false,
      }));
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      const errorMsg = "Failed to load suggestions. Please try again.";
      setState((prevState) => ({
        ...prevState,
        isLoadingAiSuggestions: false,
        aiSuggestions: [errorMsg],
      }));
      toast({
        variant: "destructive",
        title: "Suggestion Fetch Failed",
        description: (error as Error).message || errorMsg,
      });
    }
  };

  const fetchFanAnalysis = async () => {
    if (!state.isWalletConnected || !state.walletAddress) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Connect to Chiliz Spicy Testnet first.",
      });
      return;
    }
    if (!state.fandomTraits.trim()) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Please define your fandom traits for a better analysis.",
      });
    }
    setState((prevState) => ({
      ...prevState,
      isLoadingFanAnalysis: true,
      fanAnalysis: null,
    }));
    try {
      const input: GenerateFanAnalysisInput = {
        superfanScore: state.superfanScore,
        fanLevel: state.fanLevel,
        fandomTraits: state.fandomTraits,
        walletAddress: state.walletAddress,
        numNftsHeld: state.nftsHeld,
        numRitualsParticipated: state.ritualsCompleted,
      };
      const result: GenerateFanAnalysisOutput = await generateFanAnalysis(
        input
      );
      setState((prevState) => ({
        ...prevState,
        fanAnalysis: result.analysisSummary,
        isLoadingFanAnalysis: false,
      }));
    } catch (error) {
      console.error("Error fetching fan analysis:", error);
      const errorMsg = "Failed to generate fan analysis. Please try again.";
      setState((prevState) => ({
        ...prevState,
        isLoadingFanAnalysis: false,
        fanAnalysis: errorMsg,
      }));
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: (error as Error).message || errorMsg,
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
        setFandomTraits,
        fetchGeneratedBadgeArtwork,
        fetchGeneratedQuote,
        fetchAiSuggestions,
        fetchFanAnalysis,
        updateScoreOnAction,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
