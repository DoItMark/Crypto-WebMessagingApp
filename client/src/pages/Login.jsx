import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
      nav('/contacts', { replace: true });
    } catch (ex) {
      setErr(ex.message || 'Login gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-8 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-slate-500">End-to-end encrypted chat — your password unlocks your private key locally.</p>

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
            autoComplete="current-password"
          />
        </label>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button type="submit" disabled={busy}
          className="w-full rounded-md bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-50">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="text-sm text-slate-600">
          New here? <Link to="/register" className="text-indigo-600 hover:underline">Create an account</Link>
        </div>
      </form>
    </div>
  );
}
