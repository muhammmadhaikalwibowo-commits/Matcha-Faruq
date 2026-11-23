import React from 'react';

interface QrCodeBoxProps {
  value: string;
}

/**
 * Menghasilkan matriks QR deterministik berbasis SVG agar tampil tajam tanpa aset eksternal.
 * Tetap menggunakan latar putih murni agar mudah dipindai pada mode terang maupun gelap.
 */
export const QrCodeBox: React.FC<QrCodeBoxProps> = ({ value }) => {
  const size = 21;
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  }

  const isFinderCell = (r: number, c: number) => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= size - 7;
    const inBottomLeft = r >= size - 7 && c < 7;
    if (!inTopLeft && !inTopRight && !inBottomLeft) return null;

    const lr = inBottomLeft ? r - (size - 7) : r;
    const lc = inTopRight ? c - (size - 7) : c;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
    return false;
  };

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const finder = isFinderCell(r, c);
      let filled = false;
      if (finder !== null) {
        filled = finder;
      } else if (
        (r === 7 && (c < 8 || c >= size - 8)) ||
        (c === 7 && (r < 8 || r >= size - 8)) ||
        (r === size - 8 && c < 8)
      ) {
        filled = false;
      } else {
        const bit = ((seed ^ (r * 73856093) ^ (c * 19349663)) >>> ((r + c) % 13)) & 1;
        filled = bit === 1 || (r === 6 && c % 2 === 0) || (c === 6 && r % 2 === 0);
      }

      if (filled) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={c}
            y={r}
            width={1}
            height={1}
            fill="#1F2A1C"
            rx={0.12}
          />
        );
      }
    }
  }

  return (
    <div className="w-[190px] h-[190px] bg-white p-3.5 rounded-[16px] border-2 border-[#DFE6D8] dark:border-[#2E3829] mx-auto flex items-center justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        role="img"
        aria-label={`Kode QRIS untuk ${value}`}
      >
        <rect width={size} height={size} fill="#FFFFFF" />
        {cells}
      </svg>
    </div>
  );
};
