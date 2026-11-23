import React, { useState } from 'react';
import { Bell, CheckCircle2, ChevronLeft, LogOut, Moon, Sun, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTanggalJam } from '../lib/rules';
import { useApp } from '../state/AppContext';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  showBell?: boolean;
  showLogout?: boolean;
  showThemeToggle?: boolean;
  rightSlot?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  showBack = false,
  backTo,
  showBell = false,
  showLogout = false,
  showThemeToggle = true,
  rightSlot,
}) => {
  const navigate = useNavigate();
  const {
    currentUser,
    notifications,
    markAllNotificationsRead,
    logout,
    darkMode,
    toggleDarkMode,
  } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);

  const userNotifs = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id)
    : [];
  const unreadCount = userNotifs.filter((n) => !n.dibaca).length;

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const handleOpenNotif = () => {
    setNotifOpen(true);
    markAllNotificationsRead();
  };

  return (
    <>
      <header className="px-[20px] pt-1 pb-3 flex items-center justify-between gap-2 bg-[#F8FAF5] dark:bg-[#161A14] shrink-0 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Kembali"
              className="min-w-[44px] min-h-[44px] -ml-1.5 flex items-center justify-center cursor-pointer"
            >
              <span className="w-[34px] h-[34px] rounded-full bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] flex items-center justify-center text-[#1F2A1C] dark:text-[#E8EFE3] hover:border-[#4A7C3A] transition-colors">
                <ChevronLeft size={18} strokeWidth={2} />
              </span>
            </button>
          )}
          <h1 className="text-[20px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] truncate leading-tight">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {rightSlot}
          {showThemeToggle && (
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              <span className="w-[34px] h-[34px] rounded-full bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] flex items-center justify-center text-[#1F2A1C] dark:text-[#E8EFE3] hover:border-[#4A7C3A] transition-colors">
                {darkMode ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
              </span>
            </button>
          )}
          {showBell && (
            <button
              type="button"
              onClick={handleOpenNotif}
              aria-label="Notifikasi pesanan"
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              <span className="w-[34px] h-[34px] rounded-full bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] flex items-center justify-center text-[#1F2A1C] dark:text-[#E8EFE3] hover:border-[#4A7C3A] transition-colors">
                <Bell size={18} strokeWidth={2} />
              </span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#B3402F] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          {showLogout && currentUser && (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/masuk');
              }}
              aria-label="Keluar akun"
              title="Keluar"
              className="min-w-[44px] min-h-[44px] -mr-1.5 flex items-center justify-center cursor-pointer"
            >
              <span className="w-[34px] h-[34px] rounded-full bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] flex items-center justify-center text-[#6B7866] dark:text-[#9FB098] hover:text-[#B3402F] hover:border-[#B3402F] transition-colors">
                <LogOut size={16} strokeWidth={2} />
              </span>
            </button>
          )}
        </div>
      </header>

      {notifOpen && (
        <div className="absolute inset-0 z-50 bg-[#1F2A1C]/50 dark:bg-black/65 flex flex-col justify-end">
          <div className="bg-[#F8FAF5] dark:bg-[#161A14] rounded-t-[20px] border-t border-[#DFE6D8] dark:border-[#2E3829] max-h-[70%] flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#DFE6D8] dark:border-[#2E3829] flex items-center justify-between bg-white dark:bg-[#1F261C] rounded-t-[20px]">
              <h2 className="text-[16px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                Notifikasi Pesanan
              </h2>
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                aria-label="Tutup notifikasi"
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-[#6B7866] dark:text-[#9FB098] hover:text-[#1F2A1C] dark:hover:text-[#E8EFE3] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2.5 phone-scroll">
              {userNotifs.length === 0 ? (
                <p className="text-[13px] text-[#6B7866] dark:text-[#9FB098] text-center py-6">
                  Belum ada notifikasi terbaru.
                </p>
              ) : (
                userNotifs.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      navigate('/riwayat');
                    }}
                    className="w-full text-left bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] rounded-[12px] p-3 flex items-start gap-2.5 hover:border-[#4A7C3A] cursor-pointer"
                  >
                    <CheckCircle2
                      size={18}
                      strokeWidth={2}
                      className="text-[#4A7C3A] dark:text-[#9ED588] shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[#1F2A1C] dark:text-[#E8EFE3] leading-snug">
                        {n.pesan}
                      </p>
                      <p className="text-[11px] text-[#6B7866] dark:text-[#9FB098] mt-1 tabular-nums">
                        {formatTanggalJam(n.waktu)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
