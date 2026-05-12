import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { api } from '../lib/api.js';
import { deriveConversationKey, encryptMessage, decryptMessage } from '../lib/crypto.js';

const POLL_MS = 2000;

export default function Chat() {
  const { email: contactEmail } = useParams();
  const { email: myEmail, privateKey, importContactPublicKey, logout } = useAuth();
  const nav = useNavigate();

  const [convKey, setConvKey] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const seenIdsRef = useRef(new Set());
  const convKeyRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setErr('');
    setMessages([]);
    seenIdsRef.current = new Set();

    (async () => {
      try {
        const { publicKey } = await api.publicKey(contactEmail);
        const peerPub = await importContactPublicKey(publicKey);
        const key = await deriveConversationKey(privateKey, peerPub, myEmail, contactEmail);
        if (!alive) return;
        setConvKey(key);
        convKeyRef.current = key;
      } catch (ex) {
        if (!alive) return;
        setErr(`Tidak bisa mengamankan saluran: ${ex.message}`);
        if (ex.status === 401) { logout(); nav('/login', { replace: true }); }
      }
    })();

    return () => { alive = false; };
  }, [contactEmail, privateKey, myEmail]);

  useEffect(() => {
    if (!convKey) return;
    let alive = true;

    async function pull() {
      try {
        const rows = await api.conversation(contactEmail);
        const fresh = [];
        for (const row of rows) {
          if (seenIdsRef.current.has(row.id)) continue;
          seenIdsRef.current.add(row.id);
          const mine = row.sender_email === myEmail;
          let text = null;
          let decryptError = false;
          try {
            text = await decryptMessage(convKeyRef.current, row.ciphertext, row.iv);
          } catch {
            decryptError = true;
          }
          fresh.push({ id: row.id, mine, text, error: decryptError, timestamp: row.timestamp });
        }
        if (!alive || fresh.length === 0) return;
        setMessages((prev) => [...prev, ...fresh].sort((a, b) => a.id - b.id));
      } catch (ex) {
        if (!alive) return;
        if (ex.status === 401) { logout(); nav('/login', { replace: true }); }
      }
    }

    pull();
    const t = setInterval(pull, POLL_MS);
    return () => { alive = false; clearInterval(t); };
  }, [convKey, contactEmail, myEmail]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function send(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !convKey) return;
    setSending(true);
    try {
      const { ciphertext, iv } = await encryptMessage(convKey, text);
      const ts = new Date().toISOString();
      const saved = await api.sendMessage({
        receiver_email: contactEmail,
        ciphertext,
        iv,
        timestamp: ts,
      });
      if (!seenIdsRef.current.has(saved.id)) {
        seenIdsRef.current.add(saved.id);
        setMessages((prev) => [...prev, { id: saved.id, mine: true, text, error: false, timestamp: saved.timestamp }]);
      }
      setDraft('');
    } catch (ex) {
      setErr(`Pesan gagal terkirim: ${ex.message}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/contacts" className="text-slate-500 hover:text-slate-900">←</Link>
            <div>
              <h1 className="font-semibold">{contactEmail}</h1>
              <p className="text-xs text-slate-500">
                {convKey ? 'Secure channel established (AES-256-GCM)' : 'Establishing secure channel…'}
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500">{myEmail}</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white rounded-xl shadow p-4 space-y-2">
          {err && <div className="text-sm text-red-600">{err}</div>}
          {messages.length === 0 && !err && (
            <div className="text-sm text-slate-400 text-center py-8">No messages yet. Say hi.</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                m.error
                  ? 'bg-red-100 text-red-700'
                  : m.mine
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-900'
              }`}>
                {m.error ? '⚠️ Pesan tidak dapat didekripsi' : m.text}
                <div className={`text-[10px] mt-1 ${m.mine ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={send} className="mt-3 flex gap-2">
          <input
            type="text" value={draft} onChange={(e) => setDraft(e.target.value)}
            placeholder={convKey ? 'Type a message…' : 'Connecting…'}
            disabled={!convKey || sending}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
          />
          <button type="submit" disabled={!convKey || sending || !draft.trim()}
            className="rounded-md bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-50">
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
