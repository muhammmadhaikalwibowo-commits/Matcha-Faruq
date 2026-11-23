import React, { useState } from 'react';
import {
  Clock,
  Moon,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  Store,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatKm } from '../lib/rules';
import { useApp } from '../state/AppContext';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const navigate = useNavigate();
  const {
    currentUser,
    openPO,
    toggleOpenPOStatus,
    debugJarakOverride,
    setDebugJarakOverride,
    switchDemoRole,
    fastForward24Hours,
    resetDemoData,
    darkMode,
    toggleDarkMode,
  } = useApp();

  const [debugNotice, setDebugNotice] = useState<string>('');
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const isAdmin = currentUser?.peran === 'admin';

  const handleRoleSwitch = (role: 'pembeli' | 'admin') => {
    switchDemoRole(role);
    navigate(role === 'admin' ? '/admin' : '/');
  };

  const handleFastForward = () => {
    const expiredCount = fastForward24Hours();
    setDebugNotice(
      expiredCount > 0
        ? `${expiredCount} pesanan kedaluwarsa & kuota dikembalikan.`
        : 'Waktu dimajukan 24 jam (tidak ada pesanan belum bayar yang kedaluwarsa).'
    );
  };

  const handleReset = () => {
    resetDemoData();
    setDebugNotice('Data demo dikembalikan ke kondisi awal.');
    navigate('/');
  };

  const renderDemoControls = () => (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold text-[#6B7866] dark:text-[#9FB098] tracking-wide mb-2">
          Ganti Peran Demo
        </p>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] rounded-[12px]">
          <button
            type="button"
            onClick={() => handleRoleSwitch('pembeli')}
            className={`min-h-[40px] px-3 py-1.5 rounded-[9px] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              !isAdmin && currentUser
                ? 'bg-[#4A7C3A] text-white'
                : 'text-[#6B7866] dark:text-[#9FB098] hover:text-[#1F2A1C] dark:hover:text-[#E8EFE3]'
            }`}
          >
            <UserIcon size={15} />
            Pembeli
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            className={`min-h-[40px] px-3 py-1.5 rounded-[9px] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isAdmin
                ? 'bg-[#4A7C3A] text-white'
                : 'text-[#6B7866] dark:text-[#9FB098] hover:text-[#1F2A1C] dark:hover:text-[#E8EFE3]'
            }`}
          >
            <Store size={15} />
            Penjual
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px] text-[#6B7866] dark:text-[#9FB098]">
          <span className="truncate">
            Akun:{' '}
            <strong className="text-[#1F2A1C] dark:text-[#E8EFE3]">
              {currentUser ? currentUser.nama : 'Belum masuk'}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => navigate('/masuk')}
            className="text-[#4A7C3A] dark:text-[#9ED588] font-semibold hover:underline cursor-pointer shrink-0 ml-2"
          >
            Layar Login
          </button>
        </div>
      </div>

      {/* Tema Tampilan */}
      <div className="border-t border-[#DFE6D8] dark:border-[#2E3829] pt-3.5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#1F2A1C] dark:text-[#E8EFE3]">
            Tampilan Tema
          </p>
          <p className="text-[11px] text-[#6B7866] dark:text-[#9FB098]">
            {darkMode ? 'Mode Gelap aktif' : 'Mode Terang aktif'}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleDarkMode}
          className="px-3 py-1.5 rounded-full bg-[#E6F0DC] dark:bg-[#253720] text-[#2F5A24] dark:text-[#A7DF94] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer hover:brightness-95"
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          {darkMode ? 'Mode Terang' : 'Mode Gelap'}
        </button>
      </div>

      <div className="border-t border-[#DFE6D8] dark:border-[#2E3829] pt-3.5 space-y-3">
        <p className="text-[11px] font-bold text-[#6B7866] dark:text-[#9FB098] tracking-wide">
          Panel Debug Pengujian
        </p>

        {/* Toggle Open PO buka/tutup */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-[#1F2A1C] dark:text-[#E8EFE3]">
              Status Open PO
            </p>
            <p className="text-[11px] text-[#6B7866] dark:text-[#9FB098]">
              Saat ini: {openPO.status === 'buka' ? 'BUKA' : 'TUTUP'} (sisa {openPO.sisaKuota}/{openPO.kuota})
            </p>
          </div>
          <button
            type="button"
            onClick={toggleOpenPOStatus}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold cursor-pointer transition-colors ${
              openPO.status === 'buka'
                ? 'bg-[#DCEFD2] text-[#2F5A24] dark:bg-[#1F3519] dark:text-[#A7DF94] hover:brightness-95'
                : 'bg-[#F8D9D3] text-[#A3331F] dark:bg-[#3D1B17] dark:text-[#F29F94] hover:brightness-95'
            }`}
          >
            {openPO.status === 'buka' ? 'Tutup PO' : 'Buka PO'}
          </button>
        </div>

        {/* Input jarak alamat (km) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="debug-jarak-input"
              className="text-[13px] font-semibold text-[#1F2A1C] dark:text-[#E8EFE3]"
            >
              Jarak alamat (km)
            </label>
            <span className="text-[11px] text-[#6B7866] dark:text-[#9FB098] tabular-nums">
              {debugJarakOverride === null ? 'Dari kata kunci alamat' : formatKm(debugJarakOverride)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              id="debug-jarak-input"
              type="number"
              step="0.1"
              min="0"
              placeholder="Auto dari alamat"
              value={debugJarakOverride ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  setDebugJarakOverride(null);
                } else {
                  const num = Number(raw);
                  if (!Number.isNaN(num)) {
                    setDebugJarakOverride(num);
                  }
                }
              }}
              className="w-full bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] rounded-[10px] px-2.5 py-1.5 text-[13px] text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums"
            />
            {debugJarakOverride !== null && (
              <button
                type="button"
                onClick={() => setDebugJarakOverride(null)}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-[#6B7866] dark:text-[#9FB098] bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] rounded-[10px] hover:text-[#1F2A1C] dark:hover:text-[#E8EFE3] cursor-pointer shrink-0"
              >
                Auto
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {[
              { label: '1,5 km', val: 1.5 },
              { label: '2,0 km', val: 2.0 },
              { label: '2,01 km', val: 2.01 },
              { label: '7,0 km', val: 7.0 },
              { label: '20,0 km', val: 20.0 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setDebugJarakOverride(preset.val)}
                className={`px-2 py-1 rounded-[8px] text-[11px] font-semibold border cursor-pointer tabular-nums ${
                  debugJarakOverride === preset.val
                    ? 'bg-[#E6F0DC] dark:bg-[#253720] border-[#4A7C3A] text-[#2F5A24] dark:text-[#A7DF94]'
                    : 'bg-white dark:bg-[#1F261C] border-[#DFE6D8] dark:border-[#2E3829] text-[#6B7866] dark:text-[#9FB098] hover:border-[#4A7C3A]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simulasi & Keamanan */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            type="button"
            onClick={handleFastForward}
            className="w-full px-3 py-2 rounded-[10px] bg-[#FFF0C9] dark:bg-[#382B10] text-[#8A6200] dark:text-[#F5CA5C] text-[12px] font-bold flex items-center justify-center gap-1.5 hover:brightness-95 cursor-pointer"
          >
            <Clock size={15} />
            Percepat 24 jam (uji kedaluwarsa)
          </button>

          <button
            type="button"
            onClick={() => {
              if (isAdmin) switchDemoRole('pembeli');
              navigate('/bukti/MT-0141');
            }}
            className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] text-[#1F2A1C] dark:text-[#E8EFE3] text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:border-[#4A7C3A] cursor-pointer"
          >
            <ShieldAlert size={15} className="text-[#B3402F] dark:text-[#F29F94]" />
            Uji akses bukti Haikal (NFR-04)
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] text-[#6B7866] dark:text-[#9FB098] text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:text-[#B3402F] hover:border-[#B3402F] cursor-pointer"
          >
            <RotateCcw size={15} />
            Reset data demo
          </button>
        </div>

        {debugNotice && (
          <p className="text-[11px] text-[#2F5A24] dark:text-[#A7DF94] bg-[#DCEFD2] dark:bg-[#1F3519] rounded-[8px] px-2.5 py-1.5 font-medium">
            {debugNotice}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh w-full bg-[#EDF2E8] dark:bg-[#0E110C] md:py-6 md:px-6 flex items-center justify-center transition-colors">
      <div className="w-full md:w-auto flex flex-col md:flex-row items-center md:items-start justify-center gap-6">
        {/* Phone Shell: 390x844 on desktop, full screen on mobile */}
        <div className="relative w-full h-dvh md:w-[390px] md:h-[844px] bg-[#F8FAF5] dark:bg-[#161A14] md:rounded-[28px] md:border md:border-[#CFD8C6] dark:md:border-[#333F2E] flex flex-col overflow-hidden transition-colors">
          {/* Status bar (44px) */}
          <div className="h-[44px] px-[22px] flex items-center justify-between shrink-0 select-none bg-[#F8FAF5] dark:bg-[#161A14] transition-colors">
            <span className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums">
              9:41
            </span>
            <div
              className="flex items-center gap-1.5 text-[#1F2A1C] dark:text-[#E8EFE3]"
              aria-hidden="true"
            >
              <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
                <rect x="0" y="7" width="3" height="4" rx="1" />
                <rect x="4.3" y="5" width="3" height="6" rx="1" />
                <rect x="8.6" y="2.5" width="3" height="8.5" rx="1" />
                <rect x="13" y="0" width="3" height="11" rx="1" />
              </svg>
              <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
                <rect
                  x="0.75"
                  y="0.75"
                  width="18"
                  height="9.5"
                  rx="2.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <rect x="2.5" y="2.5" width="14.5" height="6" rx="1" fill="currentColor" />
                <path
                  d="M20 3.5V7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Screen content */}
          <div className="flex-1 min-h-0 flex flex-col relative">{children}</div>
        </div>

        {/* Desktop Outside Side Panel (Role Switcher + Debug Panel) */}
        <aside className="hidden md:block w-[300px] bg-white dark:bg-[#1F261C] border border-[#CFD8C6] dark:border-[#333F2E] rounded-[20px] p-5 transition-colors">
          <div className="pb-3 mb-3 border-b border-[#DFE6D8] dark:border-[#2E3829]">
            <p className="text-[15px] font-extrabold text-[#2F5A24] dark:text-[#9ED588] tracking-tight">
              MATCHA · Demo Mockup
            </p>
            <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] mt-0.5 leading-snug">
              Kontrol di luar layar ponsel untuk simulasi alur pembeli, penjual, tema, dan kasus negatif.
            </p>
          </div>
          {renderDemoControls()}
        </aside>
      </div>

      {/* Mobile-only floating debug drawer trigger */}
      <button
        type="button"
        onClick={() => setMobileToolsOpen(true)}
        aria-label="Buka panel demo"
        className="md:hidden fixed bottom-20 right-3 z-40 w-10 h-10 rounded-full bg-[#2F5A24] text-white flex items-center justify-center border border-white/40 cursor-pointer"
      >
        <SlidersHorizontal size={17} />
      </button>

      {mobileToolsOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#1F2A1C]/50 dark:bg-black/65 flex items-end">
          <div className="w-full bg-white dark:bg-[#1F261C] rounded-t-[20px] p-5 border-t border-[#DFE6D8] dark:border-[#2E3829] max-h-[85dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[15px] font-extrabold text-[#2F5A24] dark:text-[#9ED588]">
                Kontrol Demo
              </p>
              <button
                type="button"
                onClick={() => setMobileToolsOpen(false)}
                aria-label="Tutup panel demo"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#6B7866] dark:text-[#9FB098]"
              >
                <X size={20} />
              </button>
            </div>
            {renderDemoControls()}
          </div>
        </div>
      )}
    </div>
  );
};
