// src/components/layout/AppLogo.tsx
import React from 'react';
import { Sparkles } from 'lucide-react';

const AppLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold text-primary">
        FanCred AI
      </h1>
    </div>
  );
};

export default AppLogo;
