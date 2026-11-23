import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  ariaLabel?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  min = 0,
  max = 999,
  onChange,
  ariaLabel = 'Jumlah',
}) => {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={() => canDecrement && onChange(value - 1)}
        disabled={!canDecrement}
        aria-label="Kurangi jumlah"
        className={`w-[36px] h-[36px] min-w-[44px] min-h-[44px] -m-1 rounded-full flex items-center justify-center transition-colors ${
          canDecrement
            ? 'bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] text-[#1F2A1C] dark:text-[#E8EFE3] hover:border-[#4A7C3A] cursor-pointer'
            : 'bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] text-[#C9D1C3] dark:text-[#44503E] cursor-not-allowed'
        }`}
      >
        <Minus size={16} strokeWidth={2.2} />
      </button>

      <span className="w-7 text-center text-[15px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums select-none">
        {value}
      </span>

      <button
        type="button"
        onClick={() => canIncrement && onChange(value + 1)}
        disabled={!canIncrement}
        aria-label="Tambah jumlah"
        className={`w-[36px] h-[36px] min-w-[44px] min-h-[44px] -m-1 rounded-full flex items-center justify-center transition-colors ${
          canIncrement
            ? 'bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] text-[#1F2A1C] dark:text-[#E8EFE3] hover:border-[#4A7C3A] cursor-pointer'
            : 'bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] text-[#C9D1C3] dark:text-[#44503E] cursor-not-allowed'
        }`}
      >
        <Plus size={16} strokeWidth={2.2} />
      </button>
    </div>
  );
};
