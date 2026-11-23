import React from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  rightAdornment?: React.ReactNode;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  error,
  helper,
  rightAdornment,
  children,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={htmlFor}
          className="text-[12px] font-semibold text-[#1F2A1C] dark:text-[#E8EFE3] block"
        >
          {label}
        </label>
        {rightAdornment}
      </div>
      {children}
      {error ? (
        <p
          className="mt-1 text-[12px] font-medium text-[#B3402F] dark:text-[#F29F94] leading-snug"
          role="alert"
        >
          {error}
        </p>
      ) : helper ? (
        <p className="mt-1 text-[12px] text-[#6B7866] dark:text-[#9FB098] leading-snug">
          {helper}
        </p>
      ) : null}
    </div>
  );
};

export function inputClassName(hasError?: boolean): string {
  return `w-full bg-white dark:bg-[#1F261C] rounded-[12px] px-[12px] py-[12px] text-[14px] text-[#1F2A1C] dark:text-[#E8EFE3] placeholder:text-[#6B7866] dark:placeholder:text-[#9FB098] border transition-colors ${
    hasError
      ? 'border-[#B3402F] dark:border-[#F29F94] focus:border-[#B3402F]'
      : 'border-[#DFE6D8] dark:border-[#2E3829] focus:border-[#4A7C3A] dark:focus:border-[#9ED588]'
  }`;
}
