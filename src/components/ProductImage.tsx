import React, { useState } from 'react';
import { Coffee } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  gradient: string;
  className?: string;
  iconSize?: number;
  overlayCaption?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  gradient,
  className = '',
  iconSize = 24,
  overlayCaption,
}) => {
  const [failed, setFailed] = useState(false);

  const showImg = Boolean(src) && !failed;

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: gradient }}
    >
      {showImg ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover block"
        />
      ) : (
        <Coffee size={iconSize} strokeWidth={1.8} className="text-white/90" />
      )}

      {overlayCaption && (
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/75 via-black/35 to-transparent flex items-end">
          <span className="text-[12px] font-semibold text-white tracking-wide">
            {overlayCaption}
          </span>
        </div>
      )}
    </div>
  );
};
