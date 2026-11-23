import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSeedState } from '../data/seed';
import {
  BATAS_BAYAR_MS,
  LOGIN_LOCKOUT_MS,
  MAX_LOGIN_ATTEMPTS,
  MIN_PASSWORD_LENGTH,
  hitungOngkir,
  mockHashPassword,
  tentukanMetode,
  validasiEmail,
  validasiKuota,
  validasiNoHp,
  validasiSelesaiPengiriman,
} from '../lib/rules';
import type {
  AppNotification,
  CartItem,
  DetailPesanan,
  LoginLockState,
  OpenPO,
  OpenPOStatus,
  Pembayaran,
  Pengiriman,
  Pesanan,
  Produk,
  StatusKirim,
  User,
  UserRole,
} from '../types';

const STORAGE_KEY = 'matcha_open_po_state_v2';
const THEME_STORAGE_KEY = 'matcha_theme_dark_v1';

interface PersistedState {
  users: User[];
  produk: Produk[];
  openPO: OpenPO;
  pesanan: Pesanan[];
  detailPesanan: DetailPesanan[];
  pembayaran: Pembayaran[];
  pengiriman: Pengiriman[];
  notifications: AppNotification[];
  cart: CartItem[];
  currentUserId: string | null;
  loginLocks: LoginLockState;
  nextOrderSeq: number;
  simulatedTimeOffsetMs: number;
}

function buildInitialState(): PersistedState {
  const seed = createSeedState();
  return {
    ...seed,
    cart: [
      { produkId: 'prod-matcha-latte', jumlah: 2 },
    ],
    currentUserId: 'user-dina',
    loginLocks: { failedAttempts: {}, lockedUntil: {} },
    nextOrderSeq: 145,
    simulatedTimeOffsetMs: 0,
  };
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.produk)) {
      return buildInitialState();
    }
    const seedProduk = createSeedState().produk;
    return {
      ...parsed,
      produk: parsed.produk.map((p) => {
        if (p.gambarUrl) return p;
        const match = seedProduk.find((sp) => sp.id === p.id);
        return match ? { ...p, gambarUrl: match.gambarUrl } : p;
      }),
      pembayaran: Array.isArray(parsed.pembayaran)
        ? parsed.pembayaran.map((pay) => ({
            ...pay,
            metodeBayar: pay.metodeBayar ?? 'qris',
          }))
        : [],
    };
  } catch {
    return buildInitialState();
  }
}

interface RegisterInput {
  nama: string;
  email: string;
  noHp: string;
  password: string;
}

interface CreateOrderResult {
  ok: true;
  pesananId: string;
}

interface ActionFailure {
  ok: false;
  reason: string;
}

interface AppContextValue {
  users: User[];
  produk: Produk[];
  openPO: OpenPO;
  pesanan: Pesanan[];
  detailPesanan: DetailPesanan[];
  pembayaran: Pembayaran[];
  pengiriman: Pengiriman[];
  notifications: AppNotification[];
  cart: CartItem[];
  currentUser: User | null;
  nowMs: number;
  debugJarakOverride: number | null;
  setDebugJarakOverride: (val: number | null) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  // Auth
  login: (email: string, password: string) => { ok: true; user: User } | ActionFailure;
  register: (input: RegisterInput) => { ok: true; user: User } | ActionFailure;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  resetPasswordMock: (email: string, newPassword: string) => { ok: true } | ActionFailure;
  // Cart
  setCartItemQuantity: (produkId: string, jumlah: number) => void;
  addToCart: (produkId: string, jumlah: number) => void;
  clearCart: () => void;
  // Order & Payment
  createOrder: (alamat: string, jarakKm: number) => CreateOrderResult | ActionFailure;
  uploadPaymentProof: (
    pesananId: string,
    fileName: string,
    dataUrl: string,
    nominalInput: number
  ) => { ok: true } | ActionFailure;
  payWithDynamicQris: (pesananId: string) => { ok: true } | ActionFailure;
  confirmCodOrder: (pesananId: string) => { ok: true } | ActionFailure;
  // Admin actions
  updateOpenPO: (next: Partial<OpenPO>) => { ok: true } | ActionFailure;
  toggleOpenPOStatus: () => void;
  confirmPayment: (pesananId: string) => { ok: true } | ActionFailure;
  rejectPayment: (pesananId: string, alasan: string) => { ok: true } | ActionFailure;
  updateDelivery: (
    pesananId: string,
    nomorResi: string,
    statusKirim: StatusKirim
  ) => { ok: true } | ActionFailure;
  // Notifications
  markAllNotificationsRead: () => void;
  // Debug actions
  fastForward24Hours: () => number;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [debugJarakOverride, setDebugJarakOverride] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [tickNow, setTickNow] = useState<number>(() => Date.now());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, String(darkMode));
    } catch {
      // Ignore storage error
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTickNow(Date.now());
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  const nowMs = tickNow + state.simulatedTimeOffsetMs;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors on mock data
    }
  }, [state]);

  // Automatic expiry sweep for unpaid orders past 24h
  useEffect(() => {
    setState((prev) => {
      const effectiveNow = Date.now() + prev.simulatedTimeOffsetMs;
      let changed = false;
      let returnedCups = 0;

      const nextPesanan = prev.pesanan.map((order) => {
        if (order.statusPesanan !== 'menunggu_pembayaran') return order;
        const pay = prev.pembayaran.find((p) => p.pesananId === order.id);
        if (pay && !pay.waktuUnggah && effectiveNow > pay.batasWaktu) {
          changed = true;
          const cups = prev.detailPesanan
            .filter((d) => d.pesananId === order.id)
            .reduce((acc, d) => acc + d.jumlah, 0);
          returnedCups += cups;
          return { ...order, statusPesanan: 'kedaluwarsa' as const };
        }
        return order;
      });

      if (!changed) return prev;

      return {
        ...prev,
        pesanan: nextPesanan,
        openPO: {
          ...prev.openPO,
          sisaKuota: Math.min(prev.openPO.kuota, prev.openPO.sisaKuota + returnedCups),
        },
      };
    });
  }, [tickNow]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId]
  );

  const login = (emailRaw: string, password: string): { ok: true; user: User } | ActionFailure => {
    const email = emailRaw.trim().toLowerCase();
    const currentNow = Date.now() + state.simulatedTimeOffsetMs;
    const lockedUntil = state.loginLocks.lockedUntil[email] ?? 0;

    if (lockedUntil > currentNow) {
      const sisaMenit = Math.ceil((lockedUntil - currentNow) / 60000);
      return {
        ok: false,
        reason: `Akun dikunci sementara karena 5 kali gagal masuk. Coba lagi dalam ${sisaMenit} menit.`,
      };
    }

    const user = state.users.find((u) => u.email.toLowerCase() === email);
    const inputHash = mockHashPassword(password);

    if (!user || user.passwordHash !== inputHash) {
      const nextAttempts = (state.loginLocks.failedAttempts[email] ?? 0) + 1;
      const shouldLock = nextAttempts >= MAX_LOGIN_ATTEMPTS;
      setState((prev) => ({
        ...prev,
        loginLocks: {
          failedAttempts: {
            ...prev.loginLocks.failedAttempts,
            [email]: shouldLock ? 0 : nextAttempts,
          },
          lockedUntil: {
            ...prev.loginLocks.lockedUntil,
            [email]: shouldLock ? currentNow + LOGIN_LOCKOUT_MS : 0,
          },
        },
      }));
      if (shouldLock) {
        return {
          ok: false,
          reason: 'Login gagal 5 kali. Akun dikunci selama 3 menit demi keamanan.',
        };
      }
      return {
        ok: false,
        reason: `Email atau password salah (${nextAttempts}/${MAX_LOGIN_ATTEMPTS} percobaan).`,
      };
    }

    setState((prev) => ({
      ...prev,
      currentUserId: user.id,
      loginLocks: {
        failedAttempts: { ...prev.loginLocks.failedAttempts, [email]: 0 },
        lockedUntil: { ...prev.loginLocks.lockedUntil, [email]: 0 },
      },
    }));
    return { ok: true, user };
  };

  const register = (input: RegisterInput): { ok: true; user: User } | ActionFailure => {
    const email = input.email.trim().toLowerCase();
    if (!input.nama.trim()) {
      return { ok: false, reason: 'Nama lengkap wajib diisi' };
    }
    if (!validasiEmail(email)) {
      return { ok: false, reason: 'Format email belum benar' };
    }
    if (!validasiNoHp(input.noHp)) {
      return { ok: false, reason: 'Nomor HP minimal 10 digit angka' };
    }
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, reason: 'Password minimal 8 karakter' };
    }
    if (state.users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, reason: 'Email sudah terdaftar' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      nama: input.nama.trim(),
      email,
      noHp: input.noHp.trim(),
      passwordHash: mockHashPassword(input.password),
      peran: 'pembeli',
    };

    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUserId: newUser.id,
    }));

    return { ok: true, user: newUser };
  };

  const logout = () => {
    setState((prev) => ({ ...prev, currentUserId: null }));
  };

  const switchDemoRole = (role: UserRole) => {
    setState((prev) => {
      const target =
        role === 'admin'
          ? prev.users.find((u) => u.peran === 'admin')
          : prev.users.find((u) => u.email === 'dina.ayu@mail.com') ??
            prev.users.find((u) => u.peran === 'pembeli');
      return {
        ...prev,
        currentUserId: target ? target.id : prev.currentUserId,
      };
    });
  };

  const resetPasswordMock = (emailRaw: string, newPassword: string): { ok: true } | ActionFailure => {
    const email = emailRaw.trim().toLowerCase();
    if (!validasiEmail(email)) {
      return { ok: false, reason: 'Format email belum benar' };
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, reason: 'Password baru minimal 8 karakter' };
    }
    const existing = state.users.find((u) => u.email.toLowerCase() === email);
    if (!existing) {
      return { ok: false, reason: 'Email tidak ditemukan pada sistem' };
    }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === existing.id ? { ...u, passwordHash: mockHashPassword(newPassword) } : u
      ),
      loginLocks: {
        failedAttempts: { ...prev.loginLocks.failedAttempts, [email]: 0 },
        lockedUntil: { ...prev.loginLocks.lockedUntil, [email]: 0 },
      },
    }));
    return { ok: true };
  };

  const setCartItemQuantity = (produkId: string, jumlah: number) => {
    const clamped = Math.max(0, Math.floor(jumlah));
    setState((prev) => {
      if (clamped === 0) {
        return {
          ...prev,
          cart: prev.cart.filter((item) => item.produkId !== produkId),
        };
      }
      const exists = prev.cart.some((item) => item.produkId === produkId);
      if (exists) {
        return {
          ...prev,
          cart: prev.cart.map((item) =>
            item.produkId === produkId ? { ...item, jumlah: clamped } : item
          ),
        };
      }
      return {
        ...prev,
        cart: [...prev.cart, { produkId, jumlah: clamped }],
      };
    });
  };

  const addToCart = (produkId: string, jumlah: number) => {
    const safeQty = Math.max(0, Math.floor(jumlah));
    if (safeQty === 0) {
      setCartItemQuantity(produkId, 0);
      return;
    }
    setState((prev) => {
      const existing = prev.cart.find((item) => item.produkId === produkId);
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map((item) =>
            item.produkId === produkId ? { ...item, jumlah: item.jumlah + safeQty } : item
          ),
        };
      }
      return {
        ...prev,
        cart: [...prev.cart, { produkId, jumlah: safeQty }],
      };
    });
  };

  const clearCart = () => {
    setState((prev) => ({ ...prev, cart: [] }));
  };

  const createOrder = (alamat: string, jarakKm: number): CreateOrderResult | ActionFailure => {
    if (!currentUser) {
      return { ok: false, reason: 'Silakan masuk terlebih dahulu' };
    }
    if (state.cart.length === 0) {
      return { ok: false, reason: 'Keranjang belanja masih kosong' };
    }

    const totalCups = state.cart.reduce((sum, item) => sum + item.jumlah, 0);
    const kuotaCheck = validasiKuota(
      state.openPO.sisaKuota,
      totalCups,
      state.openPO.status === 'buka'
    );
    if (!kuotaCheck.ok) {
      return kuotaCheck;
    }

    // Validasi stok masing-masing produk
    for (const item of state.cart) {
      const prod = state.produk.find((p) => p.id === item.produkId);
      if (!prod) {
        return { ok: false, reason: 'Produk tidak ditemukan' };
      }
      if (item.jumlah > prod.stok) {
        return { ok: false, reason: `Stok ${prod.nama} tersisa ${prod.stok} cup` };
      }
    }

    const metode = tentukanMetode(jarakKm);
    if (metode === 'di_luar_area') {
      return { ok: false, reason: 'Alamat di luar radius layanan 15 km. Perbaiki alamat Anda.' };
    }

    const biayaKirim = hitungOngkir(jarakKm);
    const orderNum = String(state.nextOrderSeq).padStart(4, '0');
    const pesananId = `MT-${orderNum}`;
    const orderTime = Date.now() + state.simulatedTimeOffsetMs;

    const details: DetailPesanan[] = state.cart.map((item, idx) => {
      const prod = state.produk.find((p) => p.id === item.produkId)!;
      return {
        id: `det-${orderNum}-${idx + 1}`,
        pesananId,
        produkId: prod.id,
        namaProduk: prod.nama,
        jumlah: item.jumlah,
        hargaSatuan: prod.harga, // disalin saat pemesanan
        subtotal: prod.harga * item.jumlah,
      };
    });

    const subtotalProduk = details.reduce((s, d) => s + d.subtotal, 0);
    const totalBayar = subtotalProduk + biayaKirim;

    const newPesanan: Pesanan = {
      id: pesananId,
      userId: currentUser.id,
      openPoId: state.openPO.id,
      waktuPesan: orderTime,
      totalBayar,
      statusPesanan: 'menunggu_pembayaran',
    };

    const newPembayaran: Pembayaran = {
      pesananId,
      metodeBayar: 'qris',
      buktiUrl: '',
      buktiNamaFile: '',
      nominal: 0,
      statusBayar: 'menunggu',
      alasanTolak: '',
      waktuUnggah: null,
      batasWaktu: orderTime + BATAS_BAYAR_MS,
    };

    const newPengiriman: Pengiriman = {
      pesananId,
      alamat: alamat.trim(),
      jarakKm,
      metode,
      biayaKirim,
      nomorResi: '',
      statusKirim: 'diproses',
    };

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      pesananId,
      pesan: `Pesanan #${pesananId} dibuat. Selesaikan pembayaran QRIS dalam 24 jam.`,
      waktu: orderTime,
      dibaca: false,
    };

    setState((prev) => ({
      ...prev,
      pesanan: [newPesanan, ...prev.pesanan],
      detailPesanan: [...details, ...prev.detailPesanan],
      pembayaran: [newPembayaran, ...prev.pembayaran],
      pengiriman: [newPengiriman, ...prev.pengiriman],
      notifications: [newNotif, ...prev.notifications],
      openPO: {
        ...prev.openPO,
        sisaKuota: Math.max(0, prev.openPO.sisaKuota - totalCups),
      },
      produk: prev.produk.map((p) => {
        const ordered = prev.cart.find((c) => c.produkId === p.id);
        return ordered ? { ...p, stok: Math.max(0, p.stok - ordered.jumlah) } : p;
      }),
      cart: [],
      nextOrderSeq: prev.nextOrderSeq + 1,
    }));

    return { ok: true, pesananId };
  };

  const uploadPaymentProof = (
    pesananId: string,
    fileName: string,
    dataUrl: string,
    nominalInput: number
  ): { ok: true } | ActionFailure => {
    const order = state.pesanan.find((o) => o.id === pesananId);
    const pay = state.pembayaran.find((p) => p.pesananId === pesananId);
    if (!order || !pay) {
      return { ok: false, reason: 'Pesanan tidak ditemukan' };
    }
    if (currentUser && order.userId !== currentUser.id && currentUser.peran !== 'admin') {
      return { ok: false, reason: 'Akses ditolak' };
    }
    const effectiveNow = Date.now() + state.simulatedTimeOffsetMs;
    if (effectiveNow > pay.batasWaktu || order.statusPesanan === 'kedaluwarsa') {
      return { ok: false, reason: 'Batas waktu pembayaran 24 jam sudah lewat' };
    }

    setState((prev) => ({
      ...prev,
      pesanan: prev.pesanan.map((o) =>
        o.id === pesananId ? { ...o, statusPesanan: 'menunggu_konfirmasi' } : o
      ),
      pembayaran: prev.pembayaran.map((p) =>
        p.pesananId === pesananId
          ? {
              ...p,
              metodeBayar: 'qris',
              buktiUrl: dataUrl,
              buktiNamaFile: fileName,
              nominal: nominalInput,
              statusBayar: 'menunggu',
              alasanTolak: '',
              waktuUnggah: effectiveNow,
            }
          : p
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: order.userId,
          pesananId,
          pesan: `Bukti bayar #${pesananId} berhasil diunggah. Menunggu konfirmasi admin.`,
          waktu: effectiveNow,
          dibaca: false,
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  };

  const payWithDynamicQris = (pesananId: string): { ok: true } | ActionFailure => {
    const order = state.pesanan.find((o) => o.id === pesananId);
    const pay = state.pembayaran.find((p) => p.pesananId === pesananId);
    if (!order || !pay) {
      return { ok: false, reason: 'Pesanan tidak ditemukan' };
    }
    if (currentUser && order.userId !== currentUser.id && currentUser.peran !== 'admin') {
      return { ok: false, reason: 'Akses ditolak' };
    }
    const effectiveNow = Date.now() + state.simulatedTimeOffsetMs;
    if (order.statusPesanan === 'kedaluwarsa' || effectiveNow > pay.batasWaktu) {
      return { ok: false, reason: 'Batas waktu QRIS 24 jam sudah lewat' };
    }

    setState((prev) => ({
      ...prev,
      pesanan: prev.pesanan.map((o) =>
        o.id === pesananId ? { ...o, statusPesanan: 'lunas' } : o
      ),
      pembayaran: prev.pembayaran.map((p) =>
        p.pesananId === pesananId
          ? {
              ...p,
              metodeBayar: 'qris',
              statusBayar: 'lunas',
              nominal: order.totalBayar,
              alasanTolak: '',
              waktuUnggah: effectiveNow,
              buktiNamaFile: `qris-dinamis-${pesananId.toLowerCase()}`,
              dikonfirmasiOleh: 'sistem_qris_otomatis',
            }
          : p
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: order.userId,
          pesananId,
          pesan: `Pembayaran QRIS #${pesananId} berhasil & terverifikasi otomatis. Pesanan segera diproses.`,
          waktu: effectiveNow,
          dibaca: false,
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  };

  const confirmCodOrder = (pesananId: string): { ok: true } | ActionFailure => {
    const order = state.pesanan.find((o) => o.id === pesananId);
    const pay = state.pembayaran.find((p) => p.pesananId === pesananId);
    if (!order || !pay) {
      return { ok: false, reason: 'Pesanan tidak ditemukan' };
    }
    if (currentUser && order.userId !== currentUser.id && currentUser.peran !== 'admin') {
      return { ok: false, reason: 'Akses ditolak' };
    }
    const effectiveNow = Date.now() + state.simulatedTimeOffsetMs;
    if (order.statusPesanan === 'kedaluwarsa' || effectiveNow > pay.batasWaktu) {
      return { ok: false, reason: 'Batas waktu konfirmasi pesanan sudah lewat' };
    }

    setState((prev) => ({
      ...prev,
      pesanan: prev.pesanan.map((o) =>
        o.id === pesananId ? { ...o, statusPesanan: 'diproses' } : o
      ),
      pembayaran: prev.pembayaran.map((p) =>
        p.pesananId === pesananId
          ? {
              ...p,
              metodeBayar: 'cod',
              statusBayar: 'menunggu',
              nominal: order.totalBayar,
              alasanTolak: '',
              waktuUnggah: effectiveNow,
            }
          : p
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: order.userId,
          pesananId,
          pesan: `Pesanan #${pesananId} dikonfirmasi dengan COD. Siapkan uang tunai ${order.totalBayar.toLocaleString('id-ID')} saat pesanan tiba.`,
          waktu: effectiveNow,
          dibaca: false,
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  };

  const updateOpenPO = (next: Partial<OpenPO>): { ok: true } | ActionFailure => {
    const kuota = next.kuota ?? state.openPO.kuota;
    const sisaKuota = next.sisaKuota ?? state.openPO.sisaKuota;
    if (kuota <= 0) {
      return { ok: false, reason: 'Kuota open PO harus lebih dari 0' };
    }
    if (sisaKuota < 0 || sisaKuota > kuota) {
      return { ok: false, reason: `Sisa kuota harus antara 0 dan ${kuota}` };
    }
    setState((prev) => ({
      ...prev,
      openPO: { ...prev.openPO, ...next },
    }));
    return { ok: true };
  };

  const toggleOpenPOStatus = () => {
    setState((prev) => {
      const nextStatus: OpenPOStatus = prev.openPO.status === 'buka' ? 'tutup' : 'buka';
      return {
        ...prev,
        openPO: { ...prev.openPO, status: nextStatus },
      };
    });
  };

  const confirmPayment = (pesananId: string): { ok: true } | ActionFailure => {
    const order = state.pesanan.find((o) => o.id === pesananId);
    if (!order) return { ok: false, reason: 'Pesanan tidak ditemukan' };
    const effectiveNow = Date.now() + state.simulatedTimeOffsetMs;

    setState((prev) => ({
      ...prev,
      pesanan: prev.pesanan.map((o) =>
        o.id === pesananId ? { ...o, statusPesanan: 'lunas' } : o
      ),
      pembayaran: prev.pembayaran.map((p) =>
        p.pesananId === pesananId
          ? {
              ...p,
              statusBayar: 'lunas',
              alasanTolak: '',
              dikonfirmasiOleh: prev.currentUserId ?? 'user-admin',
            }
          : p
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: order.userId,
          pesananId,
          pesan: `Pembayaran #${pesananId} dikonfirmasi lunas oleh admin. Pesanan segera diproses.`,
          waktu: effectiveNow,
          dibaca: false,
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  };

  const rejectPayment = (pesananId: string, alasan: string): { ok: true } | ActionFailure => {
    if (!alasan.trim()) {
      return { ok: false, reason: 'Isi alasan penolakan terlebih dahulu' };
    }
    const order = state.pesanan.find((o) => o.id === pesananId);
    if (!order) return { ok: false, reason: 'Pesanan tidak ditemukan' };
    const effectiveNow = Date.now() + state.simulatedTimeOffsetMs;

    setState((prev) => ({
      ...prev,
      pesanan: prev.pesanan.map((o) =>
        o.id === pesananId ? { ...o, statusPesanan: 'ditolak' } : o
      ),
      pembayaran: prev.pembayaran.map((p) =>
        p.pesananId === pesananId
          ? {
              ...p,
              statusBayar: 'ditolak',
              alasanTolak: alasan.trim(),
              dikonfirmasiOleh: prev.currentUserId ?? 'user-admin',
            }
          : p
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: order.userId,
          pesananId,
          pesan: `Pembayaran #${pesananId} ditolak: ${alasan.trim()}. Unggah ulang sebelum batas 24 jam.`,
          waktu: effectiveNow,
          dibaca: false,
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  };

  const updateDelivery = (
    pesananId: string,
    nomorResi: string,
    statusKirim: StatusKirim
  ): { ok: true } | ActionFailure => {
    const ship = state.pengiriman.find((p) => p.pesananId === pesananId);
    const order = state.pesanan.find((o) => o.id === pesananId);
    if (!ship || !order) {
      return { ok: false, reason: 'Data pengiriman tidak ditemukan' };
    }

    const resiCheck = validasiSelesaiPengiriman(ship.metode, statusKirim, nomorResi);
    if (!resiCheck.ok) {
      return resiCheck;
    }

    const effectiveNow = Date.now() + state.simulatedTimeOffsetMs;
    const mappedOrderStatus =
      statusKirim === 'selesai'
        ? ('diterima' as const)
        : statusKirim === 'dikirim'
          ? ('dikirim' as const)
          : ('lunas' as const);

    const statusNotifText =
      statusKirim === 'dikirim'
        ? `Pesanan #${pesananId} telah dikirim${nomorResi.trim() ? ` (Resi: ${nomorResi.trim()})` : ''}.`
        : statusKirim === 'selesai'
          ? `Pesanan #${pesananId} telah diterima. Terima kasih telah memesan di MATCHA.`
          : `Pesanan #${pesananId} sedang diproses oleh penjual.`;

    setState((prev) => ({
      ...prev,
      pengiriman: prev.pengiriman.map((p) =>
        p.pesananId === pesananId
          ? { ...p, nomorResi: nomorResi.trim(), statusKirim }
          : p
      ),
      pesanan: prev.pesanan.map((o) =>
        o.id === pesananId ? { ...o, statusPesanan: mappedOrderStatus } : o
      ),
      pembayaran: prev.pembayaran.map((p) =>
        p.pesananId === pesananId && p.metodeBayar === 'cod' && statusKirim === 'selesai'
          ? { ...p, statusBayar: 'lunas', nominal: order.totalBayar }
          : p
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: order.userId,
          pesananId,
          pesan: statusNotifText,
          waktu: effectiveNow,
          dibaca: false,
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.userId === currentUser.id ? { ...n, dibaca: true } : n
      ),
    }));
  };

  const fastForward24Hours = (): number => {
    let expiredCount = 0;
    setState((prev) => {
      const nextOffset = prev.simulatedTimeOffsetMs + BATAS_BAYAR_MS + 60000;
      const effectiveNow = Date.now() + nextOffset;
      let returnedCups = 0;
      const newNotifs: AppNotification[] = [];

      const nextPesanan = prev.pesanan.map((order) => {
        if (order.statusPesanan !== 'menunggu_pembayaran') return order;
        const pay = prev.pembayaran.find((p) => p.pesananId === order.id);
        if (pay && !pay.waktuUnggah && effectiveNow > pay.batasWaktu) {
          expiredCount += 1;
          const cups = prev.detailPesanan
            .filter((d) => d.pesananId === order.id)
            .reduce((acc, d) => acc + d.jumlah, 0);
          returnedCups += cups;
          newNotifs.push({
            id: `notif-exp-${order.id}-${effectiveNow}`,
            userId: order.userId,
            pesananId: order.id,
            pesan: `Pesanan #${order.id} kedaluwarsa karena melewati batas 24 jam. Kuota dikembalikan.`,
            waktu: effectiveNow,
            dibaca: false,
          });
          return { ...order, statusPesanan: 'kedaluwarsa' as const };
        }
        return order;
      });

      return {
        ...prev,
        simulatedTimeOffsetMs: nextOffset,
        pesanan: nextPesanan,
        notifications: [...newNotifs, ...prev.notifications],
        openPO: {
          ...prev.openPO,
          sisaKuota: Math.min(prev.openPO.kuota, prev.openPO.sisaKuota + returnedCups),
        },
      };
    });
    return expiredCount;
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDebugJarakOverride(null);
    setState(buildInitialState());
  };

  return (
    <AppContext.Provider
      value={{
        users: state.users,
        produk: state.produk,
        openPO: state.openPO,
        pesanan: state.pesanan,
        detailPesanan: state.detailPesanan,
        pembayaran: state.pembayaran,
        pengiriman: state.pengiriman,
        notifications: state.notifications,
        cart: state.cart,
        currentUser,
        nowMs,
        debugJarakOverride,
        setDebugJarakOverride,
        darkMode,
        toggleDarkMode,
        login,
        register,
        logout,
        switchDemoRole,
        resetPasswordMock,
        setCartItemQuantity,
        addToCart,
        clearCart,
        createOrder,
        uploadPaymentProof,
        payWithDynamicQris,
        confirmCodOrder,
        updateOpenPO,
        toggleOpenPOStatus,
        confirmPayment,
        rejectPayment,
        updateDelivery,
        markAllNotificationsRead,
        fastForward24Hours,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
