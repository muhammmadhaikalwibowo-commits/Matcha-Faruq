import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Banner } from './components/Banner';
import { Button } from './components/Button';
import { PhoneFrame } from './components/PhoneFrame';
import { TopBar } from './components/TopBar';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminDeliveryPage } from './pages/AdminDeliveryPage';
import { AdminOpenPOPage } from './pages/AdminOpenPOPage';
import { AdminPaymentConfirmPage } from './pages/AdminPaymentConfirmPage';
import { AdminRecapPage } from './pages/AdminRecapPage';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { PaymentPage } from './pages/PaymentPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProofAccessPage } from './pages/ProofAccessPage';
import { RegisterPage } from './pages/RegisterPage';
import { ShippingPage } from './pages/ShippingPage';
import { AppProvider, useApp } from './state/AppContext';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, switchDemoRole } = useApp();
  const navigate = useNavigate();

  if (!currentUser || currentUser.peran !== 'admin') {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <TopBar title="Akses Penjual" showBack backTo="/" />
        <div className="flex-1 p-5 flex flex-col justify-center gap-4">
          <Banner tone="failed">
            Halaman ini hanya untuk akun Penjual/Admin Toko.
          </Banner>
          <Button
            onClick={() => {
              switchDemoRole('admin');
            }}
          >
            Masuk sebagai Admin Demo
          </Button>
          <Button variant="outline" onClick={() => navigate('/masuk')}>
            Ke Layar Login
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <PhoneFrame>
          <Routes>
            {/* Buyer routes */}
            <Route path="/daftar" element={<RegisterPage />} />
            <Route path="/masuk" element={<LoginPage />} />
            <Route path="/" element={<CatalogPage />} />
            <Route path="/produk/:id" element={<ProductDetailPage />} />
            <Route path="/keranjang" element={<CartPage />} />
            <Route path="/pengiriman" element={<ShippingPage />} />
            <Route path="/bayar/:id" element={<PaymentPage />} />
            <Route path="/riwayat" element={<HistoryPage />} />
            <Route path="/bukti/:id" element={<ProofAccessPage />} />

            {/* Seller (Admin) routes */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboardPage />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/open-po"
              element={
                <AdminGuard>
                  <AdminOpenPOPage />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/rekap"
              element={
                <AdminGuard>
                  <AdminRecapPage />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/bayar"
              element={
                <AdminGuard>
                  <AdminPaymentConfirmPage />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/kirim"
              element={
                <AdminGuard>
                  <AdminDeliveryPage />
                </AdminGuard>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PhoneFrame>
      </BrowserRouter>
    </AppProvider>
  );
}
