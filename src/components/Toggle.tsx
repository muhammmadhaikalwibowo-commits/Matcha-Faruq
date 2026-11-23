import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="min-h-[44px] inline-flex items-center cursor-pointer"
    >
      <span
        className={`relative inline-flex items-center w-[46px] h-[26px] rounded-full transition-colors ${
          checked ? 'bg-[#4A7C3A]' : 'bg-[#C9D1C3] dark:bg-[#2E352B]'
        }`}
      >
        <span
          className={`inline-block w-[20px] h-[20px] bg-white rounded-full transition-transform ${
            checked ? 'translate-x-[23px]' : 'translate-x-[3px]'
          }`}
        />
      </span>
    </button>
  );
};
