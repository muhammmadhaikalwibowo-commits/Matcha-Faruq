import React, { useState } from 'react';
import {
  Bell,
  ChevronRight,
  HelpCircle,
  Lock,
  LogOut,
  MapPin,
  Moon,
  Receipt,
  ShieldCheck,
  Store,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Field, inputClassName } from '../components/Field';
import { GoogleLogo, GoogleSignInModal } from '../components/GoogleSignInSheet';
import { TabBar } from '../components/TabBar';
import { Toggle } from '../components/Toggle';
import { TopBar } from '../components/TopBar';
import { formatRentangTanggal, formatRupiah } from '../lib/rules';
import { useApp } from '../state/AppContext';

type ProfileSheet = null | 'edit' | 'alamat' | 'password' | 'bantuan';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'MT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    pesanan,
    cart,
    notifications,
    openPO,
    darkMode,
    toggleDarkMode,
    updateProfile,
    resetPasswordMock,
    markAllNotificationsRead,
    switchDemoRole,
    logout,
  } = useApp();

  const [activeSheet, setActiveSheet] = useState<ProfileSheet>(null);
  const [googleOpen, setGoogleOpen] = useState(false);

  // Edit data diri states
  const [editNama, setEditNama] = useState('');
  const [editNoHp, setEditNoHp] = useState('');
  const [editAlamat, setEditAlamat] = useState('');
  const [sheetMsg, setSheetMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password reset state
  const [newPassword, setNewPassword] = useState('');

  const myOrders = currentUser
    ? pesanan.filter((o) => o.userId === currentUser.id)
    : [];
  const activeOrders = myOrders.filter(
    (o) =>
      o.statusPesanan === 'menunggu_pembayaran' ||
      o.statusPesanan === 'lunas' ||
      o.statusPesanan === 'diproses' ||
      o.statusPesanan === 'dikirim'
  );
  const cartCups = cart.reduce((sum, item) => sum + item.jumlah, 0);
  const unreadNotifs = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.dibaca).length
    : 0;

  const openEditSheet = () => {
    if (!currentUser) return;
    setEditNama(currentUser.nama);
    setEditNoHp(currentUser.noHp);
    setSheetMsg(null);
    setActiveSheet('edit');
  };

  const openAlamatSheet = () => {
    if (!currentUser) return;
    setEditAlamat(currentUser.alamatDefault ?? 'Jl. Melati No. 12, Kec. Menteng');
    setSheetMsg(null);
    setActiveSheet('alamat');
  };

  const openPasswordSheet = () => {
    setNewPassword('');
    setSheetMsg(null);
    setActiveSheet('password');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateProfile({ nama: editNama, noHp: editNoHp });
    if (!res.ok) {
      setSheetMsg({ ok: false, text: res.reason });
      return;
    }
    setSheetMsg({ ok: true, text: 'Data diri berhasil diperbarui.' });
  };

  const handleSaveAlamat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!editAlamat.trim()) {
      setSheetMsg({ ok: false, text: 'Alamat pengiriman tidak boleh kosong.' });
      return;
    }
    const res = updateProfile({
      nama: currentUser.nama,
      noHp: currentUser.noHp,
      alamatDefault: editAlamat,
    });
    if (!res.ok) {
      setSheetMsg({ ok: false, text: res.reason });
      return;
    }
    setSheetMsg({ ok: true, text: 'Alamat tersimpan. Otomatis dipakai saat checkout.' });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const res = resetPasswordMock(currentUser.email, newPassword);
    if (!res.ok) {
      setSheetMsg({ ok: false, text: res.reason });
      return;
    }
    setNewPassword('');
    setSheetMsg({ ok: true, text: 'Password akun berhasil diperbarui.' });
  };

  const rentangPO = formatRentangTanggal(openPO.tanggalMulai, openPO.tanggalTutup);

  return (
    <div className="flex-1 min-h-0 flex flex-col relative">
      <TopBar title="Profil Saya" showBell={Boolean(currentUser)} />

      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-4 flex flex-col gap-3 phone-scroll">
        {!currentUser ? (
          <>
            <Card className="text-center py-6 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#E6F0DC] dark:bg-[#253720] text-[#4A7C3A] dark:text-[#9ED588] flex items-center justify-center">
                <UserIcon size={26} />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                  Masuk ke Akun MATCHA
                </h2>
                <p className="text-[13px] text-[#6B7866] dark:text-[#9FB098] mt-1">
                  Simpan alamat pengiriman, pantau pesanan, dan checkout lebih cepat.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Button variant="outline" onClick={() => setGoogleOpen(true)}>
                  <GoogleLogo size={18} />
                  Masuk dengan Google
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => navigate('/masuk')}>Masuk</Button>
                  <Button variant="outline" onClick={() => navigate('/daftar')}>
                    Daftar
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-0 overflow-hidden divide-y divide-[#DFE6D8] dark:divide-[#2E3829]">
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-[10px] bg-[#E6F0DC] dark:bg-[#253720] text-[#2F5A24] dark:text-[#9ED588] flex items-center justify-center shrink-0">
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </span>
                  <div>
                    <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                      Mode Gelap
                    </p>
                    <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098]">
                      {darkMode ? 'Aktif' : 'Nonaktif'}
                    </p>
                  </div>
                </div>
                <Toggle checked={darkMode} onChange={toggleDarkMode} label="Aktifkan mode gelap" />
              </div>

              <button
                type="button"
                onClick={() => setActiveSheet('bantuan')}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAF5] dark:hover:bg-[#161A14] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-[10px] bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] text-[#4A7C3A] dark:text-[#9ED588] flex items-center justify-center shrink-0">
                    <HelpCircle size={18} />
                  </span>
                  <div>
                    <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                      Info Open PO &amp; Ongkir
                    </p>
                    <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098]">
                      Jadwal, radius layanan, &amp; pembayaran
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#6B7866] dark:text-[#9FB098]" />
              </button>
            </Card>
          </>
        ) : (
          <>
            {/* Kartu Identitas Pengguna */}
            <Card className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#E6F0DC] dark:bg-[#253720] text-[#2F5A24] dark:text-[#A7DF94] text-[18px] font-extrabold flex items-center justify-center shrink-0">
                  {getInitials(currentUser.nama)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-[17px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] truncate">
                      {currentUser.nama}
                    </h2>
                    {currentUser.authProvider === 'google' && (
                      <Chip tone="info" icon={<GoogleLogo size={11} />}>
                        Google
                      </Chip>
                    )}
                  </div>
                  <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] truncate">
                    {currentUser.email}
                  </p>
                  <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] tabular-nums">
                    {currentUser.noHp}
                  </p>
                </div>
              </div>

              {/* 3 Ringkasan Cepat */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#DFE6D8] dark:border-[#2E3829]">
                <button
                  type="button"
                  onClick={() => navigate('/riwayat')}
                  className="bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] rounded-[12px] py-2 px-2 text-center hover:border-[#4A7C3A] cursor-pointer"
                >
                  <p className="text-[16px] font-extrabold text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums">
                    {myOrders.length}
                  </p>
                  <p className="text-[11px] font-semibold text-[#6B7866] dark:text-[#9FB098]">
                    Pesanan
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/riwayat')}
                  className="bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] rounded-[12px] py-2 px-2 text-center hover:border-[#4A7C3A] cursor-pointer"
                >
                  <p className="text-[16px] font-extrabold text-[#2F5A24] dark:text-[#9ED588] tabular-nums">
                    {activeOrders.length}
                  </p>
                  <p className="text-[11px] font-semibold text-[#6B7866] dark:text-[#9FB098]">
                    Diproses
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/keranjang')}
                  className="bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] rounded-[12px] py-2 px-2 text-center hover:border-[#4A7C3A] cursor-pointer"
                >
                  <p className="text-[16px] font-extrabold text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums">
                    {cartCups}
                  </p>
                  <p className="text-[11px] font-semibold text-[#6B7866] dark:text-[#9FB098]">
                    Keranjang
                  </p>
                </button>
              </div>
            </Card>

            {/* Menu Akun */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7866] dark:text-[#9FB098] px-1">
                Akun &amp; Alamat
              </p>
              <Card className="p-0 overflow-hidden divide-y divide-[#DFE6D8] dark:divide-[#2E3829]">
                <button
                  type="button"
                  onClick={openEditSheet}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAF5] dark:hover:bg-[#161A14] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-[10px] bg-[#E6F0DC] dark:bg-[#253720] text-[#2F5A24] dark:text-[#9ED588] flex items-center justify-center shrink-0">
                      <UserIcon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                        Edit Data Diri
                      </p>
                      <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] truncate">
                        Ubah nama &amp; nomor WhatsApp
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#6B7866] dark:text-[#9FB098] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={openAlamatSheet}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAF5] dark:hover:bg-[#161A14] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-[10px] bg-[#E6F0DC] dark:bg-[#253720] text-[#2F5A24] dark:text-[#9ED588] flex items-center justify-center shrink-0">
                      <MapPin size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                        Alamat Tersimpan
                      </p>
                      <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] truncate">
                        {currentUser.alamatDefault || 'Belum diatur · Ketuk untuk isi'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#6B7866] dark:text-[#9FB098] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={openPasswordSheet}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAF5] dark:hover:bg-[#161A14] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-[10px] bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] text-[#4A7C3A] dark:text-[#9ED588] flex items-center justify-center shrink-0">
                      <Lock size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                        Keamanan &amp; Metode Masuk
                      </p>
                      <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] truncate">
                        {currentUser.authProvider === 'google'
                          ? 'Terhubung dengan akun Google'
                          : 'Ubah password akun'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#6B7866] dark:text-[#9FB098] shrink-0" />
                </button>
              </Card>
            </div>

            {/* Menu Aktivitas & Preferensi */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7866] dark:text-[#9FB098] px-1">
                Aktivitas &amp; Preferensi
              </p>
              <Card className="p-0 overflow-hidden divide-y divide-[#DFE6D8] dark:divide-[#2E3829]">
                <button
                  type="button"
                  onClick={() => navigate('/riwayat')}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAF5] dark:hover:bg-[#161A14] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-[10px] bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] text-[#4A7C3A] dark:text-[#9ED588] flex items-center justify-center shrink-0">
                      <Receipt size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                        Riwayat Pesanan
                      </p>
                      <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098]">
                        {activeOrders.length > 0
                          ? `${activeOrders.length} pesanan aktif · lacak pengiriman`
                          : 'Lihat semua transaksi QRIS & COD'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#6B7866] dark:text-[#9FB098] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => markAllNotificationsRead()}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAF5] dark:hover:bg-[#161A14] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-[10px] bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] text-[#4A7C3A] dark:text-[#9ED588] flex items-center justify-center shrink-0">
                      <Bell size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                        Notifikasi Pesanan
                      </p>
                      <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098]">
                        {unreadNotifs > 0
                          ? `${unreadNotifs} belum dibaca · ketuk untuk tandai dibaca`
                          : 'Semua notifikasi sudah dibaca'}
                      </p>
                    </div>
                  </div>
                  {unreadNotifs > 0 && (
                    <Chip tone="info">{unreadNotifs} baru</Chip>
                  )}
                </button>

                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[10px] bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] text-[#4A7C3A] dark:text-[#9ED588] flex items-center justify-center shrink-0">
                      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                        Mode Gelap
                      </p>
                      <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098]">
                        {darkMode ? 'Tema gelap aktif' : 'Tema terang aktif'}
                      </p>
                    </div>
                  </div>
                  <Toggle checked={darkMode} onChange={toggleDarkMode} label="Mode gelap" />
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSheet('bantuan')}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAF5] dark:hover:bg-[#161A14] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-[10px] bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] text-[#4A7C3A] dark:text-[#9ED588] flex items-center justify-center shrink-0">
                      <HelpCircle size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                        Info Open PO &amp; Ongkos Kirim
                      </p>
                      <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098]">
                        Periode {rentangPO} · Status {openPO.status === 'buka' ? 'BUKA' : 'TUTUP'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#6B7866] dark:text-[#9FB098] shrink-0" />
                </button>

                {currentUser.peran === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoRole('admin');
                      navigate('/admin');
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAF5] dark:hover:bg-[#161A14] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-[10px] bg-[#DBE8F7] dark:bg-[#192D42] text-[#1F4F87] dark:text-[#98C4F5] flex items-center justify-center shrink-0">
                        <Store size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                          Buka Dashboard Penjual
                        </p>
                        <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098]">
                          Kelola Open PO, rekap, &amp; pengiriman
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#6B7866] dark:text-[#9FB098] shrink-0" />
                  </button>
                )}
              </Card>
            </div>

            <div className="pt-1">
              <Button
                variant="danger"
                onClick={() => {
                  logout();
                  navigate('/masuk');
                }}
              >
                <LogOut size={17} />
                Keluar Akun
              </Button>
            </div>
          </>
        )}
      </div>

      <TabBar mode="pembeli" />

      {/* Sheet Modal */}
      {activeSheet && (
        <div className="absolute inset-0 z-50 bg-[#1F2A1C]/50 dark:bg-black/70 flex flex-col justify-end">
          <div className="bg-white dark:bg-[#1F261C] rounded-t-[22px] border-t border-[#DFE6D8] dark:border-[#2E3829] p-5 space-y-3 max-h-[85%] overflow-y-auto phone-scroll">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                {activeSheet === 'edit' && 'Edit Data Diri'}
                {activeSheet === 'alamat' && 'Alamat Pengiriman Tersimpan'}
                {activeSheet === 'password' && 'Keamanan & Metode Masuk'}
                {activeSheet === 'bantuan' && 'Info Open PO & Layanan'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                aria-label="Tutup"
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-[#6B7866] dark:text-[#9FB098] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {activeSheet === 'edit' && (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <Field label="Nama lengkap" htmlFor="prof-nama">
                  <input
                    id="prof-nama"
                    type="text"
                    value={editNama}
                    onChange={(e) => {
                      setEditNama(e.target.value);
                      setSheetMsg(null);
                    }}
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Nomor HP / WhatsApp" htmlFor="prof-hp">
                  <input
                    id="prof-hp"
                    type="tel"
                    value={editNoHp}
                    onChange={(e) => {
                      setEditNoHp(e.target.value);
                      setSheetMsg(null);
                    }}
                    className={inputClassName()}
                  />
                </Field>
                {sheetMsg && (
                  <Banner tone={sheetMsg.ok ? 'success' : 'failed'}>{sheetMsg.text}</Banner>
                )}
                <Button type="submit">Simpan perubahan</Button>
              </form>
            )}

            {activeSheet === 'alamat' && (
              <form onSubmit={handleSaveAlamat} className="space-y-3">
                <Field label="Alamat default untuk checkout" htmlFor="prof-alamat">
                  <textarea
                    id="prof-alamat"
                    rows={3}
                    value={editAlamat}
                    onChange={(e) => {
                      setEditAlamat(e.target.value);
                      setSheetMsg(null);
                    }}
                    placeholder="Contoh: Jl. Melati No. 12, Kec. Menteng"
                    className={`${inputClassName()} resize-none`}
                  />
                </Field>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Dekat toko (1,5 km)', text: 'Gg. Kenanga No. 5, Dekat toko' },
                    { label: 'Melati (7,0 km)', text: 'Jl. Melati No. 12, Kec. Menteng' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setEditAlamat(preset.text);
                        setSheetMsg(null);
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] text-[11px] font-semibold text-[#6B7866] dark:text-[#9FB098] hover:border-[#4A7C3A] hover:text-[#2F5A24] dark:hover:text-[#9ED588] cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {sheetMsg && (
                  <Banner tone={sheetMsg.ok ? 'success' : 'failed'}>{sheetMsg.text}</Banner>
                )}
                <Button type="submit">Simpan alamat</Button>
              </form>
            )}

            {activeSheet === 'password' && currentUser && (
              <div className="space-y-3">
                {currentUser.authProvider === 'google' && (
                  <Banner tone="info" icon={<ShieldCheck size={18} />}>
                    Akun ini masuk menggunakan Google ({currentUser.email}). Anda juga dapat mengatur password cadangan di bawah.
                  </Banner>
                )}
                <form onSubmit={handleSavePassword} className="space-y-3">
                  <Field label="Password baru (min. 8 karakter)" htmlFor="prof-new-pass">
                    <input
                      id="prof-new-pass"
                      type="password"
                      placeholder="Minimal 8 karakter"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setSheetMsg(null);
                      }}
                      className={inputClassName()}
                    />
                  </Field>
                  {sheetMsg && (
                    <Banner tone={sheetMsg.ok ? 'success' : 'failed'}>{sheetMsg.text}</Banner>
                  )}
                  <Button type="submit">Simpan password baru</Button>
                </form>
              </div>
            )}

            {activeSheet === 'bantuan' && (
              <div className="space-y-2.5 text-[13px] text-[#1F2A1C] dark:text-[#E8EFE3]">
                <div className="p-3 rounded-[12px] bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] space-y-1">
                  <p className="font-bold">Periode Open PO</p>
                  <p className="text-[#6B7866] dark:text-[#9FB098]">
                    Status saat ini: <strong>{openPO.status === 'buka' ? 'BUKA' : 'TUTUP'}</strong> ({rentangPO}), sisa kuota {openPO.sisaKuota}/{openPO.kuota} cup.
                  </p>
                </div>
                <div className="p-3 rounded-[12px] bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] space-y-1">
                  <p className="font-bold">Ongkos Kirim &amp; Radius</p>
                  <p className="text-[#6B7866] dark:text-[#9FB098]">
                    Jarak ≤ 2,0 km diantar penjual ({formatRupiah(5000)} flat). Jarak 2,01–15,0 km via jasa kirim ({formatRupiah(3000)}/km). Di atas 15 km di luar area layanan.
                  </p>
                </div>
                <div className="p-3 rounded-[12px] bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] space-y-1">
                  <p className="font-bold">Pembayaran QRIS Dinamis &amp; COD</p>
                  <p className="text-[#6B7866] dark:text-[#9FB098]">
                    QRIS terverifikasi otomatis oleh sistem tanpa unggah bukti. Tersedia juga COD (bayar tunai saat pesanan tiba). Batas pembayaran 24 jam.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <GoogleSignInModal
        open={googleOpen}
        mode="login"
        onClose={() => setGoogleOpen(false)}
        onSuccess={(user) => {
          setGoogleOpen(false);
          if (user.peran === 'admin') {
            navigate('/admin');
          }
        }}
      />
    </div>
  );
};
