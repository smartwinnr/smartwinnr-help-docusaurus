import React from 'react';

type Props = {
  size?: number;
  className?: string;
};

export default function WynnieMark({size = 24, className}: Props): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Wynnie"
      className={className}
      xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8 L7.5 19 L12 11 L16.5 19 L21 8" />
      <path
        d="M20.5 0.5 L21.2 2.3 L23 3 L21.2 3.7 L20.5 5.5 L19.8 3.7 L18 3 L19.8 2.3 Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
