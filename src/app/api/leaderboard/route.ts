// src/app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import { contract, tokenContract } from '@/constant/contact';
import { balanceOf as balanceOfErc721 } from "thirdweb/extensions/erc721";
import { balanceOf as balanceOfErc20 } from "thirdweb/extensions/erc20";
import { formatUnits } from "ethers/lib/utils";

// In a real application, these addresses would come from a database of users.
// For this version, we use a static list of addresses to simulate a leaderboard.
const MOCK_LEADERBOARD_ADDRESSES = [
  '0x22821210811e59de6A493A6C774134c311546554',
  '0x87971c681F613C5d15aA2e2425881204644e43A9',
  '0x41e412503a277A8A331742442D157A3485E92404',
  '0xAF3A7539D258169A187152E5A67434313B11e80C',
  '0x99539561B3361aC836e2C6A53145453664A93245',
  '0x4594285A483951A85bB66b579A59e866a4C15a1b',
  '0x8A1f34C3747514304481c92900a3e9d8919aA048',
  '0xC4B81d45A3c6043134440523C6415a6b0c8a6d71',
  '0x1234567890123456789012345678901234567890', // Invalid address to test error handling
  '0x6B1B1bA4A7A77b10214A360819a5843A2335198C',
];

type FanData = {
  rank: number;
  walletAddress: string;
  score: number;
  fanLevel: string;
  avatarText: string;
};

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

async function getFanData(address: string): Promise<Omit<FanData, 'rank' | 'avatarText'> | null> {
    try {
        const nftsHeldBigInt = await balanceOfErc721({ contract, owner: address });
        const chzBalanceBigInt = await balanceOfErc20({ contract: tokenContract, address: address });
        
        const nftsHeld = Number(nftsHeldBigInt);
        const chzBalance = parseFloat(formatUnits(chzBalanceBigInt, 18));
        const ritualsCompleted = Math.floor(Math.random() * 25); // Mock data

        const score = calculateScore(nftsHeld, ritualsCompleted, chzBalance);
        const fanLevel = getFanLevel(score);

        return {
            walletAddress: address,
            score,
            fanLevel,
        };
    } catch (error) {
        // console.error(`Failed to fetch data for ${address}`, error);
        return { walletAddress: address, score: 0, fanLevel: 'Rookie' }; // Return zero score on error
    }
}

export async function GET() {
    const fanDataPromises = MOCK_LEADERBOARD_ADDRESSES.map(getFanData);
    const results = await Promise.all(fanDataPromises);

    const validResults = results.filter(r => r !== null) as Omit<FanData, 'rank' | 'avatarText'>[];

    const sortedFans = validResults.sort((a, b) => b.score - a.score);

    const leaderboard: FanData[] = sortedFans.map((fan, index) => ({
        ...fan,
        rank: index + 1,
        avatarText: fan.walletAddress.substring(2, 4).toUpperCase(),
    }));

    return NextResponse.json(leaderboard);
}
