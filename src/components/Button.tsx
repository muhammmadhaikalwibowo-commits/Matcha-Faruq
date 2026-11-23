import React from 'react';

type ButtonVariant = 'primary' | 'outline' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  disabledReason?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  disabled = false,
  disabledReason,
  fullWidth = true,
  className = '',
  children,
  ...rest
}) => {
  const base =
    'min-h-[46px] px-4 py-[13px] rounded-[12px] text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap select-none cursor-pointer';

  let variantClass = '';
  if (disabled) {
    variantClass =
      'bg-[#C9D1C3] dark:bg-[#2E352B] text-[#7B8576] dark:text-[#75826F] cursor-not-allowed';
  } else if (variant === 'primary') {
    variantClass = 'bg-[#4A7C3A] text-white hover:bg-[#3e6a30] active:bg-[#2F5A24]';
  } else if (variant === 'outline') {
    variantClass =
      'bg-white dark:bg-[#1F261C] text-[#4A7C3A] dark:text-[#9ED588] border-[1.5px] border-[#4A7C3A] dark:border-[#6EA85B] hover:bg-[#E6F0DC]/50 dark:hover:bg-[#253720]';
  } else if (variant === 'danger') {
    variantClass = 'bg-[#B3402F] text-white hover:bg-[#993526] active:bg-[#822B1E]';
  }

  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      <button
        type="button"
        disabled={disabled}
        className={`${base} ${variantClass} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...rest}
      >
        {children}
      </button>
      {disabled && disabledReason && (
        <p className="mt-1.5 text-[12px] text-[#6B7866] dark:text-[#9FB098] text-center leading-snug">
          {disabledReason}
        </p>
      )}
    </div>
  );
};
