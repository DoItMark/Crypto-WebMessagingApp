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

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    if (password.length < 6) return setErr('Password harus terdiri dari setidaknya 6 karakter');
    if (password !== confirm) return setErr('Passwords tidak sesuai');
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
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-8 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm text-slate-500">
            Kami membuat pasangan kunci ECDH di browser Anda. Kunci privat dienkripsi dengan kata sandi Anda sebelum meninggalkan aplikasi.
        </p>

        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            autoComplete="new-password"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Confirm password</span>
          <input
            type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            autoComplete="new-password"
          />
        </label>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button type="submit" disabled={busy}
          className="w-full rounded-md bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-50">
          {busy ? 'Generating keys…' : 'Create account'}
        </button>

        <div className="text-sm text-slate-600">
          Already have one? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
