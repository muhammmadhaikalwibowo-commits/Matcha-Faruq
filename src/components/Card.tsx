import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] rounded-[14px] p-[12px] transition-colors hover:border-[#4A7C3A]/60 dark:hover:border-[#6EA85B]/60 cursor-pointer ${className}`}
      >
        {children}
      </button>
    );
  }
  return (
    <div
      className={`bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] rounded-[14px] p-[12px] ${className}`}
    >
      {children}
    </div>
  );
};
