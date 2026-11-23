import React from 'react';

export type ChipTone = 'success' | 'waiting' | 'failed' | 'info' | 'neutral';

interface ChipProps {
  tone?: ChipTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const TONE_MAP: Record<ChipTone, string> = {
  success: 'bg-[#DCEFD2] text-[#2F5A24] dark:bg-[#1F3519] dark:text-[#A7DF94]',
  waiting: 'bg-[#FFF0C9] text-[#8A6200] dark:bg-[#382B10] dark:text-[#F5CA5C]',
  failed: 'bg-[#F8D9D3] text-[#A3331F] dark:bg-[#3D1B17] dark:text-[#F29F94]',
  info: 'bg-[#DBE8F7] text-[#1F4F87] dark:bg-[#192D42] dark:text-[#98C4F5]',
  neutral: 'bg-[#E6F0DC] text-[#2F5A24] dark:bg-[#253720] dark:text-[#A7DF94]',
};

export const Chip: React.FC<ChipProps> = ({
  tone = 'neutral',
  icon,
  children,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold leading-none whitespace-nowrap shrink-0 ${TONE_MAP[tone]} ${className}`}
    >
      {icon && <span className="inline-flex items-center shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
