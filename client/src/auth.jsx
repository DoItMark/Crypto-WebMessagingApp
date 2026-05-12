import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './lib/api.js';
import {
  generateECDHKeyPair,
  exportPublicKeyJwk,
  importPublicKeyJwk,
  wrapPrivateKey,
  unwrapPrivateKey,
} from './lib/crypto.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [jwt, setJwt] = useState(() => localStorage.getItem('jwt'));
  const [email, setEmail] = useState(() => localStorage.getItem('email'));
  const [publicKeyJwk, setPublicKeyJwk] = useState(() => {
    const raw = localStorage.getItem('publicKey');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [privateKey, setPrivateKey] = useState(null);

  useEffect(() => {
    if (jwt) localStorage.setItem('jwt', jwt); else localStorage.removeItem('jwt');
  }, [jwt]);
  useEffect(() => {
    if (email) localStorage.setItem('email', email); else localStorage.removeItem('email');
  }, [email]);
  useEffect(() => {
    if (publicKeyJwk) localStorage.setItem('publicKey', JSON.stringify(publicKeyJwk));
    else localStorage.removeItem('publicKey');
  }, [publicKeyJwk]);

  const unlocked = !!privateKey && !!jwt;

  async function register(emailInput, password) {
    const keyPair = await generateECDHKeyPair();
    const jwk = await exportPublicKeyJwk(keyPair.publicKey);
    const wrapped = await wrapPrivateKey(password, keyPair.privateKey);
    const res = await api.register({
      email: emailInput,
      password,
      publicKey: JSON.stringify(jwk),
      encryptedPrivateKey: wrapped.encryptedPrivateKey,
      iv: wrapped.iv,
      kdfSalt: wrapped.kdfSalt,
    });
    setJwt(res.token);
    setEmail(res.email);
    setPublicKeyJwk(jwk);
    setPrivateKey(keyPair.privateKey);
  }

  async function login(emailInput, password) {
    const res = await api.login({ email: emailInput, password });
    const priv = await unwrapPrivateKey(password, {
      encryptedPrivateKey: res.encryptedPrivateKey,
      iv: res.iv,
      kdfSalt: res.kdfSalt,
    });
    const jwk = JSON.parse(res.publicKey);
    setJwt(res.token);
    setEmail(res.email);
    setPublicKeyJwk(jwk);
    setPrivateKey(priv);
  }

  function logout() {
    setJwt(null);
    setEmail(null);
    setPublicKeyJwk(null);
    setPrivateKey(null);
  }

  async function importContactPublicKey(jwkOrString) {
    const jwk = typeof jwkOrString === 'string' ? JSON.parse(jwkOrString) : jwkOrString;
    return importPublicKeyJwk(jwk);
  }

  const value = useMemo(
    () => ({ jwt, email, publicKeyJwk, privateKey, unlocked,
             register, login, logout, importContactPublicKey }),
    [jwt, email, publicKeyJwk, privateKey, unlocked],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
