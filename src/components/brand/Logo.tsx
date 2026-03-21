"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export const Logo = ({ className, variant = 'full' }: LogoProps) => {
  // SAVOR HAPPINESS Logo URL
  const logoUrl = "https://media.discordapp.net/attachments/1044949047972216914/1483006254543540285/SavorHappinessLogo1.png?ex=69b904b4&is=69b7b334&hm=012da9819e356154fff247275dd24079f010f176efdc6696ed0f17199e6d312f&=&format=webp&quality=lossless&width=1322&height=822";

  return (
    <div className={cn("flex items-center justify-center select-none overflow-hidden", className)}>
      <img 
        src={logoUrl} 
        alt="SAVOR HAPPINESS Logo" 
        className={cn(
          "object-contain transition-all duration-300",
          variant === 'icon' ? "max-h-full max-w-full" : "h-full w-auto"
        )}
        style={{ 
          imageRendering: 'auto',
          filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.05))'
        }}
      />
    </div>
  );
};
