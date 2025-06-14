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
  default: { nftsHeld: 0, ritualsCompleted: 0, chzBalance: 0 },
};

function calculateScore(data: UserScoreData): number {
  let score = 0;
  score += data.nftsHeld * 50; // 50 points per NFT
  score += data.ritualsCompleted * 20; // 20 points per ritual
  score += Math.floor(data.chzBalance / 10) * 5; // 5 points per 10 CHZ (max 500 points from CHZ)
  
  // Ensure score is within a reasonable range, e.g., 0-1000
  return Math.min(Math.max(score, 0), 1000);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  // Simulate fetching data for the user
  // In a real app, you'd query your DB or blockchain here
  if (!mockUserScoreData[walletAddress]) {
    // Initialize a new user with some random baseline data for demo purposes
    mockUserScoreData[walletAddress] = {
      nftsHeld: Math.floor(Math.random() * 5),
      ritualsCompleted: Math.floor(Math.random() * 10),
      chzBalance: Math.floor(Math.random() * 500),
    };
  }
  
  const userData = mockUserScoreData[walletAddress];
  const score = calculateScore(userData);

  return NextResponse.json({
    walletAddress,
    score,
    nftsHeld: userData.nftsHeld,
    ritualsCompleted: userData.ritualsCompleted,
    chzBalance: userData.chzBalance,
  });
}

// Placeholder for POST to update score data (e.g., after a ritual)
export async function POST(request: Request) {
  try {
    const { walletAddress, action } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    if (!mockUserScoreData[walletAddress]) {
      mockUserScoreData[walletAddress] = { nftsHeld: 0, ritualsCompleted: 0, chzBalance: 0 };
    }

    // Simulate an action that updates user data, e.g., completing a ritual
    if (action === 'complete_ritual') {
      mockUserScoreData[walletAddress].ritualsCompleted += 1;
      // In a real app, you might also update XP here
    } else if (action === 'acquire_nft') {
      mockUserScoreData[walletAddress].nftsHeld +=1;
    }
    // Add more actions as needed

    const newScore = calculateScore(mockUserScoreData[walletAddress]);
    
    return NextResponse.json({
      walletAddress,
      score: newScore,
      message: `User data updated due to ${action}. New score: ${newScore}`,
      nftsHeld: mockUserScoreData[walletAddress].nftsHeld,
      ritualsCompleted: mockUserScoreData[walletAddress].ritualsCompleted,
    });

  } catch (error) {
    console.error('Error processing POST request to /api/score:', error);
    return NextResponse.json({ error: 'Failed to update score data' }, { status: 500 });
  }
}
