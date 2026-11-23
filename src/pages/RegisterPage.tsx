import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Field, inputClassName } from '../components/Field';
import { TopBar } from '../components/TopBar';
import { MIN_PASSWORD_LENGTH, validasiEmail, validasiNoHp } from '../lib/rules';
import { useApp } from '../state/AppContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useApp();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [errors, setErrors] = useState<{
    nama?: string;
    email?: string;
    noHp?: string;
    password?: string;
    form?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};

    if (!nama.trim()) {
      nextErrors.nama = 'Nama lengkap wajib diisi';
    }
    if (!validasiEmail(email)) {
      nextErrors.email = 'Format email belum benar';
    }
    if (!validasiNoHp(noHp)) {
      nextErrors.noHp = 'Masukkan nomor HP aktif minimal 10 digit';
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = 'Password minimal 8 karakter';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const res = register({ nama, email, noHp, password });
    if (!res.ok) {
      if (res.reason.toLowerCase().includes('email')) {
        setErrors({ email: res.reason });
      } else {
        setErrors({ form: res.reason });
      }
      return;
    }

    navigate('/');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar title="Daftar Akun" showBack backTo="/masuk" />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex-1 min-h-0 flex flex-col px-[20px] pb-6 overflow-y-auto phone-scroll"
      >
        <p className="text-[13px] text-[#6B7866] dark:text-[#9FB098] mb-4">
          Buat akun pembeli untuk memesan matcha open PO dan memantau pengiriman.
        </p>

        <div className="space-y-3">
          <Field label="Nama lengkap" htmlFor="reg-nama" error={errors.nama}>
            <input
              id="reg-nama"
              type="text"
              placeholder="Contoh: Dina Ayu"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                if (errors.nama) setErrors((p) => ({ ...p, nama: undefined }));
              }}
              className={inputClassName(Boolean(errors.nama))}
            />
          </Field>

          <Field label="Email" htmlFor="reg-email" error={errors.email}>
            <input
              id="reg-email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              className={inputClassName(Boolean(errors.email))}
            />
          </Field>

          <Field label="Nomor HP / WhatsApp" htmlFor="reg-hp" error={errors.noHp}>
            <input
              id="reg-hp"
              type="tel"
              placeholder="081234567890"
              value={noHp}
              onChange={(e) => {
                setNoHp(e.target.value);
                if (errors.noHp) setErrors((p) => ({ ...p, noHp: undefined }));
              }}
              className={inputClassName(Boolean(errors.noHp))}
            />
          </Field>

          <Field label="Password" htmlFor="reg-pass" error={errors.password}>
            <div className="relative">
              <input
                id="reg-pass"
                type={showPass ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                className={`${inputClassName(Boolean(errors.password))} pr-11`}
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

          {errors.form && (
            <p className="text-[12px] font-medium text-[#B3402F] dark:text-[#F29F94]" role="alert">
              {errors.form}
            </p>
          )}
        </div>

        <div className="flex-1 min-h-4" />

        <div className="pt-4 space-y-3">
          <Button type="submit">Daftar</Button>
          <p className="text-center text-[13px] text-[#6B7866] dark:text-[#9FB098]">
            Sudah punya akun?{' '}
            <Link to="/masuk" className="text-[#4A7C3A] dark:text-[#9ED588] font-bold hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
