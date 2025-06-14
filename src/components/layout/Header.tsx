// src/components/layout/Header.tsx
import React from 'react';
import AppLogo from './AppLogo';
import WalletInfo from '../wallet/WalletInfo';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <AppLogo />
        <WalletInfo />
      </div>
    </header>
  );
};

export default Header;
