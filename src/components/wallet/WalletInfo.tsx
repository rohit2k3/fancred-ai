// src/components/wallet/WalletInfo.tsx
"use client";

import React from "react";
import { useUser } from "@/contexts/UserContext";
import { ConnectButton, darkTheme } from "thirdweb/react";
import { useToast } from "@/hooks/use-toast";
import { client } from "@/client";
import { chilizChainId, wallets } from "@/constant/contact";

const WalletInfo = () => {
  const {
    walletAddress,
    isWalletConnected,
    connectWallet,
    disconnectWallet,
    isConnecting,
  } = useUser();

  const { toast } = useToast();


  return (
    <ConnectButton
      client={client}
      theme={darkTheme({
        colors: {
          primaryButtonBg: "#9b87f5",
          primaryButtonText: "white",
          secondaryButtonBg: "transparent",
          secondaryButtonText: "#9b87f5",
        },
      })}
      chain={{
        id: chilizChainId,
        rpc: "https://rpc.ankr.com/chiliz",
      }}
      connectButton={{
        style: {
          fontSize: "16px",
          height: "fit-content",
        },
        label: "Sign In",
      }}
      wallets={wallets}
    />
  );
};

export default WalletInfo;
