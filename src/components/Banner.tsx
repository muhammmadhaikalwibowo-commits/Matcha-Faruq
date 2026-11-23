import React from 'react';
import { AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';

export type BannerTone = 'success' | 'failed' | 'waiting' | 'info';

interface BannerProps {
  tone?: BannerTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const BANNER_STYLES: Record<BannerTone, string> = {
  success: 'bg-[#DCEFD2] text-[#2F5A24] dark:bg-[#1F3519] dark:text-[#A7DF94]',
  failed: 'bg-[#F8D9D3] text-[#A3331F] dark:bg-[#3D1B17] dark:text-[#F29F94]',
  waiting: 'bg-[#FFF0C9] text-[#8A6200] dark:bg-[#382B10] dark:text-[#F5CA5C]',
  info: 'bg-[#DBE8F7] text-[#1F4F87] dark:bg-[#192D42] dark:text-[#98C4F5]',
};

const DEFAULT_ICONS: Record<BannerTone, React.ReactNode> = {
  success: <CheckCircle2 size={18} strokeWidth={2} />,
  failed: <AlertCircle size={18} strokeWidth={2} />,
  waiting: <Clock size={18} strokeWidth={2} />,
  info: <Info size={18} strokeWidth={2} />,
};

export const Banner: React.FC<BannerProps> = ({
  tone = 'success',
  icon,
  children,
  className = '',
}) => {
  return (
    <div
      role={tone === 'failed' ? 'alert' : 'status'}
      className={`rounded-[12px] px-[12px] py-[10px] text-[12px] font-semibold flex items-start gap-2 leading-snug ${BANNER_STYLES[tone]} ${className}`}
    >
      <span className="shrink-0 mt-[1px]">{icon ?? DEFAULT_ICONS[tone]}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};
