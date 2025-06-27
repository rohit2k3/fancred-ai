
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
          primaryButtonBg: "hsl(263.4 95.3% 53.5%)",
          primaryButtonText: "white",
          secondaryButtonBg: "hsl(215 27.9% 16.9%)",
          secondaryButtonText: "white",
          connectedButtonBg: "hsl(215 27.9% 16.9%)",
          modalBg: "#0d1120",
          dropdownBg: "#0d1120",
          borderColor: "hsla(0,0%,100%,0.1)"
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
