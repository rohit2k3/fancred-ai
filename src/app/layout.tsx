import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/contexts/UserContext';
import { ThirdwebProvider } from "thirdweb/react";
import { ThemeProvider } from '@/components/layout/ThemeProvider';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-full bg-background -z-10">
           <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(230,57,70,0.5)] opacity-50 blur-[80px]"></div>
        </div>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThirdwebProvider>
            <UserProvider>
              {children}
              <Toaster />
            </UserProvider>
          </ThirdwebProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
