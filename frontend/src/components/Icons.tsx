import React from 'react';

export function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      
      <path d="M4 4l16 16" />
      <path d="M20 4L4 20" />
    </svg>
  );
}
