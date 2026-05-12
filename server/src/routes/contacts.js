import { Router } from 'express';
import { q } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const rows = q.listOtherUsers.all(req.user.email);
  res.json(rows);
});

router.get('/:email/publickey', requireAuth, (req, res) => {
  const row = q.getPublicKey.get(req.params.email);
  if (!row) return res.status(404).json({ error: 'Contact not found' });
  res.json({ email: req.params.email, publicKey: row.public_key });
});

export default router;
