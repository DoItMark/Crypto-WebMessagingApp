import { Router } from 'express';
import { q } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.post('/', requireAuth, (req, res) => {
  const { receiver_email, ciphertext, iv, timestamp } = req.body || {};
  if (!receiver_email || !ciphertext || !iv) {
    return res.status(400).json({ error: 'Missing message fields' });
  }
  const sender = req.user.email;
  if (sender === receiver_email) {
    return res.status(400).json({ error: 'Cannot send to self' });
  }
  if (!q.findUserByEmail.get(receiver_email)) {
    return res.status(404).json({ error: 'Receiver not found' });
  }

  const ts = timestamp && !isNaN(Date.parse(timestamp))
    ? new Date(timestamp).toISOString()
    : new Date().toISOString();

  const info = q.insertMessage.run(sender, receiver_email, ciphertext, iv, ts);
  res.json({ id: info.lastInsertRowid, sender_email: sender, receiver_email, ciphertext, iv, timestamp: ts });
});

router.get('/:contactEmail', requireAuth, (req, res) => {
  const rows = q.listConversation.all({
    me: req.user.email,
    other: req.params.contactEmail,
  });
  res.json(rows);
});

export default router;
