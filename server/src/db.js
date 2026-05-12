import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DB_PATH || './data/app.db';
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    public_key TEXT NOT NULL,
    encrypted_private_key TEXT NOT NULL,
    private_key_iv TEXT NOT NULL,
    kdf_salt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_email TEXT NOT NULL,
    receiver_email TEXT NOT NULL,
    ciphertext TEXT NOT NULL,
    iv TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (sender_email) REFERENCES users(email),
    FOREIGN KEY (receiver_email) REFERENCES users(email)
  );

  CREATE INDEX IF NOT EXISTS idx_messages_pair_time
    ON messages(sender_email, receiver_email, timestamp);
`);

export const q = {
  createUser: db.prepare(`
    INSERT INTO users (email, hashed_password, password_salt,
                       public_key, encrypted_private_key, private_key_iv, kdf_salt)
    VALUES (@email, @hashed_password, @password_salt,
            @public_key, @encrypted_private_key, @private_key_iv, @kdf_salt)
  `),
  findUserByEmail: db.prepare(`SELECT * FROM users WHERE email = ?`),
  listOtherUsers: db.prepare(`
    SELECT email, created_at FROM users WHERE email != ? ORDER BY email
  `),
  getPublicKey: db.prepare(`SELECT public_key FROM users WHERE email = ?`),
  insertMessage: db.prepare(`
    INSERT INTO messages (sender_email, receiver_email, ciphertext, iv, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `),
  listConversation: db.prepare(`
    SELECT id, sender_email, receiver_email, ciphertext, iv, timestamp
    FROM messages
    WHERE (sender_email = @me AND receiver_email = @other)
       OR (sender_email = @other AND receiver_email = @me)
    ORDER BY id ASC
  `),
};

export default db;
