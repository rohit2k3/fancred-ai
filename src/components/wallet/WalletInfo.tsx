
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
          primaryButtonBg: "hsl(217 91% 60%)",
          primaryButtonText: "white",
          secondaryButtonBg: "hsl(217 33% 17%)",
          secondaryButtonText: "white",
          connectedButtonBg: "hsl(217 33% 17%)",
          modalBg: "hsl(222 84% 4.9%)",
          dropdownBg: "hsl(222 84% 4.9%)",
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
