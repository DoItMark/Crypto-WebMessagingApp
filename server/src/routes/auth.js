import { Router } from 'express';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { q } from '../db.js';
import { issueToken, requireAuth } from '../auth.js';

const router = Router();
const BCRYPT_ROUNDS = 12;

function isValidEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      publicKey,
      encryptedPrivateKey,
      iv,
      kdfSalt,
    } = req.body || {};

    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!publicKey || !encryptedPrivateKey || !iv || !kdfSalt) {
      return res.status(400).json({ error: 'Missing crypto payload' });
    }

    if (q.findUserByEmail.get(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordSalt = randomBytes(16).toString('base64');
    const hashed = await bcrypt.hash(password + passwordSalt, BCRYPT_ROUNDS);

    q.createUser.run({
      email,
      hashed_password: hashed,
      password_salt: passwordSalt,
      public_key: typeof publicKey === 'string' ? publicKey : JSON.stringify(publicKey),
      encrypted_private_key: encryptedPrivateKey,
      private_key_iv: iv,
      kdf_salt: kdfSalt,
    });

    const token = await issueToken(email);
    res.json({ token, email });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!isValidEmail(email) || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = q.findUserByEmail.get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password + user.password_salt, user.hashed_password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = await issueToken(email);
    res.json({
      token,
      email,
      encryptedPrivateKey: user.encrypted_private_key,
      iv: user.private_key_iv,
      kdfSalt: user.kdf_salt,
      publicKey: user.public_key,
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  const user = q.findUserByEmail.get(req.user.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    email: user.email,
    publicKey: user.public_key,
    encryptedPrivateKey: user.encrypted_private_key,
    iv: user.private_key_iv,
    kdfSalt: user.kdf_salt,
  });
});

export default router;
