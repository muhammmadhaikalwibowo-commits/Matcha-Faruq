import React from 'react';
import {
  BadgeCheck,
  CalendarRange,
  Coffee,
  FileSpreadsheet,
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Truck,
  User,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../state/AppContext';

interface TabBarProps {
  mode: 'pembeli' | 'admin';
}

export const TabBar: React.FC<TabBarProps> = ({ mode }) => {
  const { cart } = useApp();

  const cartCount = cart.reduce((sum, item) => sum + item.jumlah, 0);

  const buyerTabs = [
    { to: '/', label: 'Katalog', icon: Coffee, end: true, badge: 0 },
    { to: '/keranjang', label: 'Keranjang', icon: ShoppingCart, end: false, badge: cartCount },
    { to: '/riwayat', label: 'Riwayat', icon: Receipt, end: false, badge: 0 },
    { to: '/profil', label: 'Profil', icon: User, end: false, badge: 0 },
  ];

  const sellerTabs = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, badge: 0 },
    { to: '/admin/open-po', label: 'Open PO', icon: CalendarRange, end: false, badge: 0 },
    { to: '/admin/rekap', label: 'Rekap', icon: FileSpreadsheet, end: false, badge: 0 },
    { to: '/admin/bayar', label: 'Bayar', icon: BadgeCheck, end: false, badge: 0 },
    { to: '/admin/kirim', label: 'Kirim', icon: Truck, end: false, badge: 0 },
  ];

  const tabs = mode === 'admin' ? sellerTabs : buyerTabs;

  return (
    <nav
      aria-label={mode === 'admin' ? 'Navigasi Penjual' : 'Navigasi Pembeli'}
      className="h-[70px] bg-white dark:bg-[#1F261C] border-t border-[#DFE6D8] dark:border-[#2E3829] grid shrink-0 transition-colors"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
                isActive
                  ? 'text-[#4A7C3A] dark:text-[#9ED588]'
                  : 'text-[#6B7866] dark:text-[#9FB098] hover:text-[#1F2A1C] dark:hover:text-[#E8EFE3]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.9} />
                  {tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#4A7C3A] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] leading-none whitespace-nowrap ${
                    isActive ? 'font-bold' : 'font-semibold'
                  }`}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
