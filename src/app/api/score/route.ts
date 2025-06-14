// src/app/api/score/route.ts
import { NextResponse } from 'next/server';

// Mock database or on-chain data source
interface UserScoreData {
  nftsHeld: number;
  ritualsCompleted: number;
  chzBalance: number; // Mocked, in a real app, fetch from Chiliz RPC
}

// In a real app, this data would come from a database or live on-chain queries
const mockUserScoreData: { [walletAddress: string]: UserScoreData } = {
  // Pre-populate with some diverse examples if needed for testing
  // '0x123...abc': { nftsHeld: 5, ritualsCompleted: 10, chzBalance: 500 },
};

function calculateScore(data: UserScoreData): number {
  let score = 0;
  score += data.nftsHeld * 50; // 50 points per NFT
  score += data.ritualsCompleted * 20; // 20 points per ritual
  score += Math.min(Math.floor(data.chzBalance / 10) * 5, 500); // 5 points per 10 CHZ, max 500 points from CHZ balance
  
  // Ensure score is within a reasonable range, e.g., 0-1000
  return Math.min(Math.max(score, 0), 1000);
}

function getInitialUserData(walletAddress: string): UserScoreData {
   if (!mockUserScoreData[walletAddress]) {
    // Initialize a new user with some random baseline data for demo purposes
    // Make it more varied and somewhat "realistic" for a new user
    const nfts = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 3) + 1; // 30% chance 0 NFTs, else 1-3
    const rituals = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 5) + 1; // 50% chance 0 rituals, else 1-5
    const balance = Math.floor(Math.random() * 200) + (Math.random() < 0.2 ? 500 : 50); // Random balance, 20% chance of higher base

    mockUserScoreData[walletAddress] = {
      nftsHeld: nfts,
      ritualsCompleted: rituals,
      chzBalance: balance,
    };
  }
  return mockUserScoreData[walletAddress];
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }
  
  const userData = getInitialUserData(walletAddress); // Ensures user data exists
  const score = calculateScore(userData);

  return NextResponse.json({
    walletAddress,
    score,
    nftsHeld: userData.nftsHeld,
    ritualsCompleted: userData.ritualsCompleted,
    chzBalance: userData.chzBalance,
  });
}

export async function POST(request: Request) {
  try {
    const { walletAddress, action } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const userData = getInitialUserData(walletAddress); // Ensures user data exists or is initialized

    let actionMessage = "User data updated";

    if (action === 'complete_ritual') {
      userData.ritualsCompleted += 1;
      actionMessage = `Ritual completed! Your participation is noted.`;
    } else if (action === 'acquire_nft') {
      userData.nftsHeld +=1;
      actionMessage = `New NFT acquired! Your collection grows.`;
    } else {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }
    
    // Update the stored mock data
    mockUserScoreData[walletAddress] = userData;

    const newScore = calculateScore(userData);
    
    return NextResponse.json({
      walletAddress,
      score: newScore,
      message: `${actionMessage} New score: ${newScore}`,
      nftsHeld: userData.nftsHeld,
      ritualsCompleted: userData.ritualsCompleted,
      chzBalance: userData.chzBalance,
    });

  } catch (error) {
    console.error('Error processing POST request to /api/score:', error);
    let message = 'Failed to update score data';
    if (error instanceof Error) {
        message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
