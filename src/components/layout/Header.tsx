// src/components/layout/Header.tsx
import React from 'react';
import AppLogo from './AppLogo';
import WalletInfo from '../wallet/WalletInfo';
import { ThemeToggle } from './ThemeToggle';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/50 backdrop-blur-lg">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <AppLogo />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WalletInfo />
        </div>
      </div>
    </header>
  );
};

export default Header;
