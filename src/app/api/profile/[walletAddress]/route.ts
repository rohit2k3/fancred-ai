// src/app/api/profile/[walletAddress]/route.ts
import { NextResponse } from 'next/server';
import { contract, tokenContract } from '@/constant/contact';
import { balanceOf as balanceOfErc721 } from "thirdweb/extensions/erc721";
import { balanceOf as balanceOfErc20 } from "thirdweb/extensions/erc20";
import { formatUnits } from "ethers/lib/utils";

function calculateScore(nftsHeld: number, ritualsCompleted: number, chzBalance: number): number {
  let score = 0;
  score += nftsHeld * 50;
  score += ritualsCompleted * 20;
  score += Math.min(Math.floor(chzBalance / 10) * 5, 500);
  return Math.min(Math.max(score, 0), 1000);
}

function getFanLevel(score: number): string {
    if (score > 700) return "Legend";
    if (score > 300) return "Pro";
    return "Rookie";
}

export async function GET(
    request: Request,
    { params }: { params: { walletAddress: string } }
) {
    const walletAddress = params.walletAddress;

    if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    try {
        const nftsHeldBigInt = await balanceOfErc721({ contract, owner: walletAddress });
        const chzBalanceBigInt = await balanceOfErc20({ contract: tokenContract, address: walletAddress });

        const nftsHeld = Number(nftsHeldBigInt);
        const chzBalance = parseFloat(formatUnits(chzBalanceBigInt, 18));
        
        // This data would come from a database.
        const ritualsCompleted = Math.floor(Math.random() * 25); 
        const fandomTraits = "Real-time data from on-chain sources, traits would be stored in a DB.";
        const joinDate = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toLocaleDateString();

        const score = calculateScore(nftsHeld, ritualsCompleted, chzBalance);
        const fanLevel = getFanLevel(score);
        
        // In a real app, you would also fetch the badge artwork URI from your database or another source.
        const badgeArtworkUrl = `https://placehold.co/300x300.png`; 

        return NextResponse.json({
            walletAddress,
            superfanScore: score,
            fanLevel,
            nftsHeld,
            ritualsCompleted,
            chzBalance,
            fandomTraits,
            joinDate,
            badgeArtworkUrl,
        });

    } catch (error) {
        console.error(`Error fetching profile data for ${walletAddress}:`, error);
        return NextResponse.json({ error: "Failed to load fan profile. The address may be invalid." }, { status: 500 });
    }
}
