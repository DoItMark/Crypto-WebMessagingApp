import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    if (password.length < 6) return setErr('Password harus terdiri dari setidaknya 6 karakter');
    if (password !== confirm) return setErr('Password tidak sesuai');
    setBusy(true);
    try {
      await register(email.trim().toLowerCase(), password);
      nav('/contacts', { replace: true });
    } catch (ex) {
      setErr(ex.message || 'Registrasi gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm mb-4">
          <span>←</span>
          <span>Kembali ke Beranda</span>
        </Link>
        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-8 w-full space-y-4">
        <h1 className="text-2xl font-bold">Buat Akun</h1>
        <p className="text-sm text-slate-500">
            Kami membuat pasangan kunci ECDH di browser Anda. Kunci privat dienkripsi dengan kata sandi Anda sebelum meninggalkan aplikasi.
        </p>

        <label htmlFor="register-email" className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            id="register-email"
            name="email"
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            autoComplete="email"
          />
        </label>

        <label htmlFor="register-password" className="block">
          <span className="text-sm font-medium">Password</span>
          <div className="mt-1 relative">
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 outline-none focus:border-indigo-500"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </label>

        <label htmlFor="register-confirm" className="block">
          <span className="text-sm font-medium">Konfirmasi Password</span>
          <div className="mt-1 relative">
            <input
              id="register-confirm"
              name="confirm-password"
              type={showConfirm ? 'text' : 'password'} required value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 outline-none focus:border-indigo-500"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showConfirm ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </label>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button type="submit" disabled={busy}
          className="w-full rounded-md bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-50">
          {busy ? 'Membuat kunci...' : 'Buat Akun'}
        </button>

        <div className="text-sm text-slate-600">
          Sudah punya akun? <Link to="/login" className="text-indigo-600 hover:underline">Masuk</Link>
        </div>
        </form>
      </div>
    </div>
  );
}
