import React from 'react';
import { ChevronRight, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../state/AppContext';
import type { User, UserRole } from '../types';

export const GoogleLogo: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.09.73-2.48 1.16-4.22 1.16-3.24 0-5.99-2.19-6.97-5.13H1.04v3.14C3.05 21.15 7.21 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.03 14.02A7.18 7.18 0 0 1 4.65 12c0-.7.13-1.38.38-2.02V6.84H1.04A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.04 5.16l3.99-3.14Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.51-3.51C18.07 1.19 15.3 0 12 0 7.21 0 3.05 2.85 1.04 6.84l3.99 3.14c.98-2.94 3.73-5.23 6.97-5.23Z"
    />
  </svg>
);

interface GoogleSignInModalProps {
  open: boolean;
  mode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const GOOGLE_ACCOUNTS: Array<{
  nama: string;
  email: string;
  keterangan: string;
  peran: UserRole;
  initials: string;
}> = [
  {
    nama: 'Raihan Rifqi',
    email: 'raihan.rifqi@gmail.com',
    keterangan: 'Pembeli · Akun Google',
    peran: 'pembeli',
    initials: 'RR',
  },
  {
    nama: 'Haikal Wibowo',
    email: 'haikal.wibowo@gmail.com',
    keterangan: 'Pembeli · Akun Google',
    peran: 'pembeli',
    initials: 'HW',
  },
  {
    nama: 'Ashfa Abimanyu',
    email: 'ashfa.abimanyu@gmail.com',
    keterangan: 'Pembeli · Akun Google',
    peran: 'pembeli',
    initials: 'AA',
  },
  {
    nama: 'Admin Matcha',
    email: 'admin@matcha.id',
    keterangan: 'Penjual / Admin Toko',
    peran: 'admin',
    initials: 'AM',
  },
];

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  open,
  mode = 'login',
  onClose,
  onSuccess,
}) => {
  const { loginWithGoogle } = useApp();

  if (!open) return null;

  const handleSelectAccount = (acc: { nama: string; email: string; peran: UserRole }) => {
    const res = loginWithGoogle(acc);
    if (res.ok) {
      onSuccess(res.user);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-[#1F2A1C]/55 dark:bg-black/75 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'register' ? 'Daftar dengan Google' : 'Pilih akun Google'}
    >
      <div className="w-full max-w-[340px] bg-white dark:bg-[#1F261C] rounded-[20px] border border-[#DFE6D8] dark:border-[#2E3829] shadow-xl overflow-hidden">
        {/* Google Popup Header */}
        <div className="px-4 pt-4 pb-3 border-b border-[#DFE6D8] dark:border-[#2E3829] flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] flex items-center justify-center shrink-0">
              <GoogleLogo size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] leading-tight">
                Pilih akun Google
              </h2>
              <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] mt-0.5">
                untuk melanjutkan ke <strong className="text-[#2F5A24] dark:text-[#9ED588]">MATCHA</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pop up akun Google"
            className="min-w-[38px] min-h-[38px] -mr-1.5 -mt-1 flex items-center justify-center rounded-full text-[#6B7866] dark:text-[#9FB098] hover:bg-[#F8FAF5] dark:hover:bg-[#161A14] hover:text-[#1F2A1C] dark:hover:text-[#E8EFE3] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Account list */}
        <div className="divide-y divide-[#DFE6D8] dark:divide-[#2E3829] max-h-[340px] overflow-y-auto phone-scroll">
          {GOOGLE_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => handleSelectAccount(acc)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#F8FAF5] dark:hover:bg-[#161A14] active:bg-[#E6F0DC] dark:active:bg-[#253720] transition-colors cursor-pointer"
            >
              <span className="w-10 h-10 rounded-full bg-[#E6F0DC] dark:bg-[#253720] text-[#2F5A24] dark:text-[#A7DF94] text-[13px] font-bold flex items-center justify-center shrink-0">
                {acc.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] truncate">
                  {acc.nama}
                </p>
                <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] truncate">
                  {acc.email}
                </p>
                <p className="text-[11px] font-semibold text-[#4A7C3A] dark:text-[#9ED588] mt-0.5">
                  {acc.keterangan}
                </p>
              </div>
              <ChevronRight size={17} className="text-[#6B7866] dark:text-[#9FB098] shrink-0" />
            </button>
          ))}
        </div>

        {/* Footer note */}
        <div className="px-4 py-3 bg-[#F8FAF5] dark:bg-[#161A14] border-t border-[#DFE6D8] dark:border-[#2E3829] flex items-center gap-2 text-[11px] text-[#6B7866] dark:text-[#9FB098]">
          <ShieldCheck size={14} className="text-[#4A7C3A] dark:text-[#9ED588] shrink-0" />
          <span>Ketuk salah satu akun di atas untuk langsung masuk.</span>
        </div>
      </div>
    </div>
  );
};
