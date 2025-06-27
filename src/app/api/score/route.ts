// src/app/api/score/route.ts
import { NextResponse } from 'next/server';
import { contract, tokenContract } from '@/constant/contact';
import { balanceOf as balanceOfErc721 } from "thirdweb/extensions/erc721";
import { balanceOf as balanceOfErc20 } from "thirdweb/extensions/erc20";
import { formatUnits } from "ethers/lib/utils";

// This function calculates the score based on on-chain data.
// The data for 'ritualsCompleted' would typically come from a database,
// as it's an off-chain action. For now, it's a mock value.
function calculateScore(nftsHeld: number, ritualsCompleted: number, chzBalance: number): number {
  let score = 0;
  score += nftsHeld * 50; // 50 points per NFT
  score += ritualsCompleted * 20; // 20 points per ritual
  score += Math.min(Math.floor(chzBalance / 10) * 5, 500); // 5 points per 10 CHZ, max 500 points from CHZ balance

  // Ensure score is within a reasonable range, e.g., 0-1000
  return Math.min(Math.max(score, 0), 1000);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  try {
    // Fetch real on-chain data
    const nftsHeldBigInt = await balanceOfErc721({ contract, owner: walletAddress });
    const chzBalanceBigInt = await balanceOfErc20({ contract: tokenContract, address: walletAddress });

    const nftsHeld = Number(nftsHeldBigInt);
    // CHZ token has 18 decimals, format it to a readable number
    const chzBalance = parseFloat(formatUnits(chzBalanceBigInt, 18));

    // Rituals completed would come from a database. We'll mock this part.
    const ritualsCompleted = Math.floor(Math.random() * 25); // Mock data for rituals

    const score = calculateScore(nftsHeld, ritualsCompleted, chzBalance);

    return NextResponse.json({
      walletAddress,
      score,
      nftsHeld,
      ritualsCompleted, // This is still mocked
      chzBalance,
    });

  } catch (error) {
    console.error(`Error fetching on-chain data for ${walletAddress}:`, error);
    // Return a default/zero score on error to prevent app from crashing
    return NextResponse.json({
      walletAddress,
      score: 0,
      nftsHeld: 0,
      ritualsCompleted: 0,
      chzBalance: 0,
      error: "Failed to fetch on-chain data. The wallet address might not be valid or there was a network issue.",
    }, { status: 500 });
  }
}
