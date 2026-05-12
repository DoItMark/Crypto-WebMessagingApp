const ALG_MAP = {
  ES256: { namedCurve: 'P-256', hash: 'SHA-256' },
  ES384: { namedCurve: 'P-384', hash: 'SHA-384' },
  ES512: { namedCurve: 'P-521', hash: 'SHA-512' },
};

export function base64urlEncode(data) {
  let bytes;
  if (data instanceof Uint8Array) bytes = data;
  else if (data instanceof ArrayBuffer) bytes = new Uint8Array(data);
  else if (typeof data === 'string') bytes = new TextEncoder().encode(data);
  else bytes = new TextEncoder().encode(JSON.stringify(data));

  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function base64urlDecodeToString(str) {
  return new TextDecoder().decode(base64urlDecode(str));
}

export async function pemToKey(pem, algorithm, usages) {
  const isPrivate = /PRIVATE KEY/.test(pem);
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return crypto.subtle.importKey(
    isPrivate ? 'pkcs8' : 'spki',
    bytes.buffer,
    algorithm,
    true,
    usages,
  );
}

export async function sign(header, payload, claims, privateKey) {
  if (!header || typeof header !== 'object') throw new Error('JWT header required');
  if (!header.alg) throw new Error('JWT header.alg required');
  const algSpec = ALG_MAP[header.alg];
  if (!algSpec) throw new Error(`Unsupported alg: ${header.alg}`);

  const fullHeader = { typ: 'JWT', ...header };
  const fullPayload = { ...(payload || {}), ...(claims || {}) };

  const h64 = base64urlEncode(JSON.stringify(fullHeader));
  const p64 = base64urlEncode(JSON.stringify(fullPayload));
  const signingInput = `${h64}.${p64}`;

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: algSpec.hash } },
    privateKey,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64urlEncode(new Uint8Array(sig))}`;
}

export async function verify(jwt, publicKey, options = {}) {
  if (typeof jwt !== 'string') throw new Error('JWT must be a string');
  const parts = jwt.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT: expected 3 segments');
  const [h64, p64, s64] = parts;

  let header, payload;
  try { header = JSON.parse(base64urlDecodeToString(h64)); }
  catch { throw new Error('Invalid JWT header (not JSON)'); }
  try { payload = JSON.parse(base64urlDecodeToString(p64)); }
  catch { throw new Error('Invalid JWT payload (not JSON)'); }

  if (options.algs && !options.algs.includes(header.alg)) {
    throw new Error(`Algorithm "${header.alg}" not allowed`);
  }
  const algSpec = ALG_MAP[header.alg];
  if (!algSpec) throw new Error(`Unsupported alg: ${header.alg}`);

  const signature = base64urlDecode(s64);
  const ok = await crypto.subtle.verify(
    { name: 'ECDSA', hash: { name: algSpec.hash } },
    publicKey,
    signature,
    new TextEncoder().encode(`${h64}.${p64}`),
  );
  if (!ok) throw new Error('Signature verification failed');

  const now = Math.floor(Date.now() / 1000);
  const tol = options.clockTolerance || 0;

  if (!options.ignoreExp && typeof payload.exp === 'number') {
    if (payload.exp + tol < now) throw new Error('Token expired');
  }
  if (!options.ignoreNbf && typeof payload.nbf === 'number') {
    if (payload.nbf - tol > now) throw new Error('Token not yet valid (nbf)');
  }
  if (options.iss && payload.iss !== options.iss) {
    throw new Error(`Issuer mismatch: expected "${options.iss}", got "${payload.iss}"`);
  }
  if (options.sub && payload.sub !== options.sub) {
    throw new Error(`Subject mismatch: expected "${options.sub}", got "${payload.sub}"`);
  }
  if (options.jti && payload.jti !== options.jti) {
    throw new Error(`JTI mismatch: expected "${options.jti}", got "${payload.jti}"`);
  }
  if (options.aud) {
    const want = Array.isArray(options.aud) ? options.aud : [options.aud];
    const got = Array.isArray(payload.aud) ? payload.aud : (payload.aud ? [payload.aud] : []);
    if (!want.some((a) => got.includes(a))) throw new Error('Audience mismatch');
  }

  return { header, payload, signature };
}
