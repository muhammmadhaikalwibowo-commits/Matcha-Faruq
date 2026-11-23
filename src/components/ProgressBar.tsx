import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.max(0, Math.min(100, Math.round((value / safeMax) * 100)));

  return (
    <div
      className="w-full h-[8px] bg-[#DFE6D8] dark:bg-[#2E3829] rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={safeMax}
    >
      <div
        className="h-full bg-[#4A7C3A] rounded-full transition-[width] duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
