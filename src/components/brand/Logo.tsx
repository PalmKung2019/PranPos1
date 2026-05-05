"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

import { Coffee } from 'lucide-react';

export const Logo = ({ className, variant = 'full' }: LogoProps) => {
  return (
    <div className={cn("flex items-center justify-center select-none overflow-hidden text-primary", className)}>
      <Coffee className={cn("text-primary drop-shadow-md", variant === 'icon' ? "w-10 h-10" : "w-12 h-12")} />
    </div>
  );
};
