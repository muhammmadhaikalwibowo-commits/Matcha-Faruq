import React, { useState } from 'react';
import { Coffee, Eye, EyeOff, Moon, Sun, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Field, inputClassName } from '../components/Field';
import { validasiEmail } from '../lib/rules';
import { useApp } from '../state/AppContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, resetPasswordMock, darkMode, toggleDarkMode } = useApp();

  const [email, setEmail] = useState('dina.ayu@mail.com');
  const [password, setPassword] = useState('12345678');
  const [showPass, setShowPass] = useState(false);

  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const [formErr, setFormErr] = useState('');

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetMsg, setResetMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailErr('');
    setPassErr('');
    setFormErr('');

    if (!validasiEmail(email)) {
      setEmailErr('Format email belum benar');
      return;
    }
    if (!password) {
      setPassErr('Masukkan password Anda');
      return;
    }

    const res = login(email, password);
    if (!res.ok) {
      setFormErr(res.reason);
      return;
    }

    navigate(res.user.peran === 'admin' ? '/admin' : '/');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = resetPasswordMock(resetEmail, resetNewPass);
    if (!res.ok) {
      setResetMsg({ ok: false, text: res.reason });
      return;
    }
    setResetMsg({
      ok: true,
      text: 'Password berhasil diperbarui. Silakan masuk dengan password baru.',
    });
    setEmail(resetEmail);
    setPassword(resetNewPass);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col px-[20px] pt-3 pb-6 overflow-y-auto phone-scroll relative">
      {/* Top theme button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
        >
          <span className="w-[34px] h-[34px] rounded-full bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] flex items-center justify-center text-[#1F2A1C] dark:text-[#E8EFE3] hover:border-[#4A7C3A]">
            {darkMode ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
          </span>
        </button>
      </div>

      {/* Brand header */}
      <div className="pt-1 pb-6 flex flex-col items-center text-center">
        <div className="w-[54px] h-[54px] rounded-[16px] bg-[#E6F0DC] dark:bg-[#253720] text-[#2F5A24] dark:text-[#9ED588] flex items-center justify-center mb-3">
          <Coffee size={28} strokeWidth={2} />
        </div>
        <h1 className="text-[34px] font-extrabold tracking-tight text-[#2F5A24] dark:text-[#9ED588] leading-none">
          MATCHA
        </h1>
        <p className="mt-2 text-[14px] text-[#6B7866] dark:text-[#9FB098]">
          Pesan matcha open PO, tanpa ribet.
        </p>
      </div>

      {/* Demo account helper */}
      <div className="mb-4 bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] rounded-[12px] p-2.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-[#6B7866] dark:text-[#9FB098]">
          Isi cepat akun demo:
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEmail('dina.ayu@mail.com');
              setPassword('12345678');
              setFormErr('');
            }}
            className="px-2.5 py-1 rounded-full bg-[#E6F0DC] dark:bg-[#1F3519] text-[#2F5A24] dark:text-[#A7DF94] text-[11px] font-bold cursor-pointer hover:brightness-95"
          >
            Pembeli
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@matcha.id');
              setPassword('12345678');
              setFormErr('');
            }}
            className="px-2.5 py-1 rounded-full bg-[#DBE8F7] dark:bg-[#192D42] text-[#1F4F87] dark:text-[#98C4F5] text-[11px] font-bold cursor-pointer hover:brightness-95"
          >
            Penjual
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col">
        <div className="space-y-3">
          <Field label="Email" htmlFor="login-email" error={emailErr}>
            <input
              id="login-email"
              type="email"
              placeholder="dina.ayu@mail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailErr) setEmailErr('');
                if (formErr) setFormErr('');
              }}
              className={inputClassName(Boolean(emailErr))}
            />
          </Field>

          <Field
            label="Password"
            htmlFor="login-pass"
            error={passErr}
            rightAdornment={
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetNewPass('');
                  setResetMsg(null);
                  setForgotOpen(true);
                }}
                className="text-[12px] font-semibold text-[#4A7C3A] dark:text-[#9ED588] hover:underline cursor-pointer"
              >
                Lupa password?
              </button>
            }
          >
            <div className="relative">
              <input
                id="login-pass"
                type={showPass ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passErr) setPassErr('');
                  if (formErr) setFormErr('');
                }}
                className={`${inputClassName(Boolean(passErr))} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Sembunyikan password' : 'Lihat password'}
                className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#6B7866] dark:text-[#9FB098] hover:text-[#1F2A1C] dark:hover:text-[#E8EFE3] cursor-pointer"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          {formErr && <Banner tone="failed">{formErr}</Banner>}
        </div>

        <div className="flex-1 min-h-4" />

        <div className="pt-4 space-y-3">
          <Button type="submit">Masuk</Button>
          <p className="text-center text-[13px] text-[#6B7866] dark:text-[#9FB098]">
            Belum punya akun?{' '}
            <Link to="/daftar" className="text-[#4A7C3A] dark:text-[#9ED588] font-bold hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </form>

      {/* Pemulihan password sheet */}
      {forgotOpen && (
        <div className="absolute inset-0 z-50 bg-[#1F2A1C]/50 dark:bg-black/65 flex flex-col justify-end">
          <div className="bg-white dark:bg-[#1F261C] rounded-t-[20px] border-t border-[#DFE6D8] dark:border-[#2E3829] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                Pemulihan Password
              </h2>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                aria-label="Tutup"
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-[#6B7866] dark:text-[#9FB098]"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResetSubmit} className="space-y-3">
              <Field label="Email terdaftar" htmlFor="reset-email">
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={inputClassName()}
                />
              </Field>
              <Field label="Password baru (min. 8 karakter)" htmlFor="reset-pass">
                <input
                  id="reset-pass"
                  type="password"
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className={inputClassName()}
                />
              </Field>
              {resetMsg && (
                <Banner tone={resetMsg.ok ? 'success' : 'failed'}>{resetMsg.text}</Banner>
              )}
              <Button type="submit">Simpan Password Baru</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
