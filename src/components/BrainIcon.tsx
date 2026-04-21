import React from 'react';

interface BrainIconProps {
  size?: number;
  className?: string;
  fill?: string;
  strokeWidth?: number;
}

export const BrainIcon = ({ size = 24, className = "", fill = "none", strokeWidth = 1.5 }: BrainIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff9a9e" />
        <stop offset="100%" stopColor="#fecfef" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
        <feOffset dx="0.5" dy="0.5" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.3" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Main Brain mass - Single cohesive iconic shape */}
    <path 
      d="M21 12.5c0-5.5-4.5-9.5-9.5-9.5S2 7.5 2 12.5c0 1.5.5 3 1.5 4.5 1 2 3.5 3 5.5 3 1.5 0 3-.5 4-1.5 1-1 2.5-1.5 4-1.5 2.5 0 4-2 4-4.5z" 
      fill="url(#brainGradient)"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Anatomical Fissures and Sulci */}
    <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
      {/* Sylvian Fissure */}
      <path d="M3 12.5c3.5-.5 7 1 9 3.5" />
      
      {/* Central Sulcus */}
      <path d="M11.5 3c.5 3-1 5.5-2.5 7.5" />
      
      {/* Frontal Lobe folds */}
      <path d="M6.5 6.5c1-.5 2 0 2.5 1" />
      <path d="M4.5 9.5c1.5 0 2.5 1 2.5 2.5" />
      <path d="M9 11.5c.5-1.5 1.5-2 2.5-2" />
      
      {/* Parietal Lobe folds */}
      <path d="M14.5 4.5c1.5 0 2.5 1 2.5 2.5" />
      <path d="M17.5 8c0 1.5-1.5 2-2.5 2" />
      <path d="M13.5 9.5c1.5 0 2.5 1 2.5 2.5" />
      
      {/* Occipital Lobe folds */}
      <path d="M19.5 11c-1 0-1.5 1-1.5 2" />
      
      {/* Temporal Lobe folds */}
      <path d="M5.5 15.5c1.5 0 2.5 1 2.5 2.5" />
      <path d="M10.5 17.5c0 1.5-1.5 2-2.5 2" />
    </g>
  </svg>
);
