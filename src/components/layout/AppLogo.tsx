// src/components/layout/AppLogo.tsx
import React from 'react';
import { ShieldCheck } from 'lucide-react'; // Example icon

const AppLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-headline font-bold text-primary">
        FanCred AI
      </h1>
    </div>
  );
};

export default AppLogo;
