import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { api } from '../lib/api.js';

export default function Contacts() {
  const { email, logout } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    api.contacts()
      .then((data) => { if (alive) { setItems(data); setLoading(false); } })
      .catch((ex) => {
        if (!alive) return;
        setErr(ex.message);
        setLoading(false);
        if (ex.status === 401) { logout(); nav('/login', { replace: true }); }
      });
    return () => { alive = false; };
  }, []);

  return (
    <div className="min-h-full">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-semibold">Kontak</h1>
            <p className="text-xs text-slate-500">Masuk sebagai {email}</p>
          </div>
          <button onClick={() => { logout(); nav('/login', { replace: true }); }}
            className="text-sm text-slate-600 hover:text-slate-900">Keluar</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading && <div className="text-sm text-slate-500">Memuat...</div>}
        {err && <div className="text-sm text-red-600">{err}</div>}
        {!loading && items.length === 0 && (
          <div className="text-sm text-slate-500">Belum ada pengguna lain — daftarkan akun kedua untuk mulai bercerita.</div>
        )}
        <ul className="bg-white rounded-xl shadow divide-y divide-slate-100">
          {items.map((c) => (
            <li key={c.email}>
              <Link to={`/chat/${encodeURIComponent(c.email)}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                <div>
                  <div className="font-medium">{c.email}</div>
                  <div className="text-xs text-slate-500">bergabung {new Date(c.created_at).toLocaleDateString('id-ID')}</div>
                </div>
                <span className="text-indigo-600 text-sm">Buka chat →</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
