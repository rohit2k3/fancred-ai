import { client } from "@/client";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { createWallet, inAppWallet } from "thirdweb/wallets";

export const chilizChainId = 88882;
export const contractAddress = "0x128503A9BB609513Dd046bec51feEfD97EA134b2";
export const tokenAddress = "0xBd5bABA6EB9591e12dfBb8C044b177832B1E6DB0";

export const contract = getContract({
  client: client,
  chain: defineChain(chilizChainId),
  address: contractAddress,
});

export const tokenContract = getContract({
  client: client,
  chain: defineChain(chilizChainId),
  address: tokenAddress,
});

export const wallets = [
  // inAppWallet(),
  createWallet("io.metamask"),
  createWallet("io.zerion.wallet"),
];