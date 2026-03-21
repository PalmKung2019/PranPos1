
"use client"

import React from 'react';

export const SavorLanguagesIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M3.5 12H20.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M12 3C14.5013 5.33842 15.9228 8.5307 16 12C15.9228 15.4693 14.5013 18.6616 12 21C9.49872 18.6616 8.07725 15.4693 8 12C8.07725 8.5307 9.49872 5.33842 12 3Z" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" 
      fill="currentColor" 
      className="text-accent"
    />
  </svg>
);
