import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/contexts/UserContext';
import { ThirdwebProvider } from "thirdweb/react";
// import { ChilizSpicy } from "@thirdweb-dev/chains";

export const metadata: Metadata = {
  title: 'FanCred AI',
  description: 'Superfan Score & Dynamic NFT Badge dApp',
};

// You should store your Thirdweb client ID in an environment variable
// For example: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
const thirdwebClientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!thirdwebClientId || thirdwebClientId === "YOUR_THIRDWEB_CLIENT_ID") {
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "Thirdweb Client ID is not set or is using the default placeholder. " +
      "Please set NEXT_PUBLIC_THIRDWEB_CLIENT_ID in your environment variables for production builds. " +
      "You can get a client ID from https://thirdweb.com/dashboard"
    );
  } else {
     console.info(
      "Thirdweb Client ID is using a placeholder. This is fine for development. " +
      "For production, ensure NEXT_PUBLIC_THIRDWEB_CLIENT_ID is set. " +
      "Get a client ID from https://thirdweb.com/dashboard"
    );
  }
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col relative">
         <div className="absolute top-0 left-0 w-full h-full bg-background -z-10">
          <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(124,58,237,0.8),rgba(255,255,255,0))]"></div>
          <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(124,58,237,0.8),rgba(255,255,255,0))]"></div>
        </div>
        <ThirdwebProvider>
          <UserProvider>
            {children}
            <Toaster />
          </UserProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
