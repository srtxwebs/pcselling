/* ==========================================================================
   RedGear Backend Starter — real accounts, real security.

   This is what actually fixes the "auth security" gap the static site
   can't fix on its own: passwords never leave this server unencrypted,
   bcrypt hashing + salting happens server-side where a browser can't see
   or bypass it, and sessions are signed JWTs instead of a value sitting
   in localStorage.

   This is a starting point, not a finished production system — see the
   README in this folder for what to still do before handling real
   customer data (HTTPS, env secrets, backups, etc).
   ========================================================================== */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');
const path = require('path');

// ---- Build Advisor: real AI, not a script ----
// Calls Anthropic's API server-side so the API key never reaches the
// browser. Requires an ANTHROPIC_API_KEY environment variable — get one
// at https://console.anthropic.com/settings/keys. Without it, this
// endpoint returns a clear 501 so the frontend can fall back gracefully
// instead of silently failing.
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

// Server-side copy of the parts catalog (id, name, price, and enough spec
// detail for real FPS reasoning) — kept here, not trusted from the client,
// so a request can't smuggle in fake parts or prices. Keep this in sync
// with PARTS in js/builder.js if you add/remove parts there.
const ADVISOR_CATALOG = {
  cpu: [
    { id: 'cpu1', name: 'Intel Core i3-14100', price: 139, tier: 'entry, 4 cores' },
    { id: 'cpu2', name: 'AMD Ryzen 5 5600', price: 129, tier: 'entry, 6 cores' },
    { id: 'cpu3', name: 'Intel Core i5-13400F', price: 189, tier: 'mid, 10 cores' },
    { id: 'cpu4', name: 'AMD Ryzen 5 7500F', price: 159, tier: 'mid, 6 cores' },
    { id: 'cpu5', name: 'AMD Ryzen 5 7600X', price: 249, tier: 'mid-high, 6 cores' },
    { id: 'cpu6', name: 'Intel Core i5-14600K', price: 319, tier: 'high, 14 cores' },
    { id: 'cpu7', name: 'Intel Core i5-14600KF', price: 299, tier: 'high, 14 cores' },
    { id: 'cpu8', name: 'AMD Ryzen 7 5800X3D', price: 299, tier: 'high, 8 cores, 3D V-Cache' },
    { id: 'cpu9', name: 'AMD Ryzen 7 7700X', price: 349, tier: 'high, 8 cores' },
    { id: 'cpu10', name: 'Intel Core i7-14700K', price: 419, tier: 'very high, 20 cores' },
    { id: 'cpu11', name: 'Intel Core i7-14700KF', price: 399, tier: 'very high, 20 cores' },
    { id: 'cpu12', name: 'AMD Ryzen 7 7800X3D', price: 449, tier: 'flagship gaming, 3D V-Cache' },
    { id: 'cpu13', name: 'AMD Ryzen 9 7900X', price: 429, tier: 'very high, 12 cores' },
    { id: 'cpu14', name: 'Intel Core i9-14900K', price: 589, tier: 'flagship, 24 cores' },
    { id: 'cpu15', name: 'AMD Ryzen 9 7950X', price: 599, tier: 'flagship, 16 cores' },
    { id: 'cpu16', name: 'Intel Core i9-14900KS', price: 699, tier: 'flagship+, 24 cores' },
  ],
  gpu: [
    { id: 'gpu1', name: 'GTX 1660 Super 8GB', price: 189, tier: 'budget 1080p' },
    { id: 'gpu2', name: 'RTX 3050 8GB', price: 229, tier: 'entry ray tracing, 1080p' },
    { id: 'gpu3', name: 'RX 6600 8GB', price: 199, tier: 'solid 1080p' },
    { id: 'gpu4', name: 'RX 7600 8GB', price: 269, tier: 'efficient 1080p/1440p' },
    { id: 'gpu5', name: 'RTX 4060 8GB', price: 299, tier: '1080p/1440p' },
    { id: 'gpu6', name: 'RTX 4060 Ti 8GB', price: 399, tier: 'strong 1440p' },
    { id: 'gpu7', name: 'RX 7700 XT 12GB', price: 449, tier: '1440p value' },
    { id: 'gpu8', name: 'RTX 4070 12GB', price: 549, tier: 'excellent 1440p ray tracing' },
    { id: 'gpu9', name: 'RX 7800 XT 16GB', price: 499, tier: 'excellent 1440p value' },
    { id: 'gpu10', name: 'RTX 4070 Super 12GB', price: 599, tier: 'great 1440p+' },
    { id: 'gpu11', name: 'RTX 4070 Ti Super 16GB', price: 799, tier: 'high-end 1440p/4K' },
    { id: 'gpu12', name: 'RX 7900 XT 20GB', price: 749, tier: 'high-end 4K' },
    { id: 'gpu13', name: 'RTX 4080 Super 16GB', price: 999, tier: 'elite 4K' },
    { id: 'gpu14', name: 'RX 7900 XTX 24GB', price: 949, tier: 'AMD flagship, 4K' },
    { id: 'gpu15', name: 'RTX 4090 24GB', price: 1599, tier: 'flagship, uncompromising' },
  ],
  ram: [
    { id: 'ram1', name: '8GB DDR4-3200', price: 29 }, { id: 'ram2', name: '16GB DDR4-3200', price: 49 },
    { id: 'ram3', name: '16GB DDR5-5200', price: 59 }, { id: 'ram4', name: '16GB DDR5-6000', price: 69 },
    { id: 'ram5', name: '32GB DDR4-3600', price: 89 }, { id: 'ram6', name: '32GB DDR5-6000', price: 119 },
    { id: 'ram7', name: '32GB DDR5-6400', price: 149 }, { id: 'ram8', name: '32GB DDR5-7200', price: 179 },
    { id: 'ram9', name: '48GB DDR5-6000', price: 169 }, { id: 'ram10', name: '64GB DDR4-3200', price: 179 },
    { id: 'ram11', name: '64GB DDR5-6000', price: 229 }, { id: 'ram12', name: '64GB DDR5-6400', price: 259 },
    { id: 'ram13', name: '96GB DDR5-6000', price: 349 }, { id: 'ram14', name: '128GB DDR5-5600', price: 499 },
    { id: 'ram15', name: '128GB DDR5-6000', price: 549 },
  ],
  storage: [
    { id: 'sto1', name: '500GB SATA SSD', price: 34 }, { id: 'sto3', name: '500GB NVMe SSD (Gen3)', price: 39 },
    { id: 'sto4', name: '1TB NVMe SSD (Gen3)', price: 59 }, { id: 'sto6', name: '1TB NVMe SSD (Gen4)', price: 79 },
    { id: 'sto7', name: '2TB NVMe SSD (Gen4)', price: 139 }, { id: 'sto9', name: '1TB NVMe SSD (Gen5)', price: 149 },
  ],
  case: [
    { id: 'case1', name: 'RedGear Pico Mini-ITX', price: 89 }, { id: 'case6', name: 'RedGear Vortex ATX', price: 129 },
    { id: 'case9', name: 'RedGear Eclipse ATX Pro', price: 179 }, { id: 'case11', name: 'RedGear Titan Full Tower', price: 189 },
  ],
  motherboard: [
    { id: 'mobo1', name: 'RedGear H610 Basic', price: 99 }, { id: 'mobo3', name: 'RedGear B760 Pulse', price: 149 },
    { id: 'mobo4', name: 'RedGear B650 Strike', price: 159 }, { id: 'mobo9', name: 'RedGear Z790 Vanguard', price: 219 },
  ],
  cooling: [
    { id: 'cool1', name: 'Stock Cooler', price: 0 }, { id: 'cool4', name: 'Air Cooler — Tower 120mm', price: 39 },
    { id: 'cool7', name: '240mm AIO Liquid Cooler', price: 99 }, { id: 'cool9', name: '360mm AIO Liquid Cooler', price: 159 },
  ],
  psu: [
    { id: 'psu2', name: '550W 80+ Bronze', price: 54 }, { id: 'psu6', name: '750W 80+ Gold', price: 94 },
    { id: 'psu9', name: '850W 80+ Gold', price: 109 }, { id: 'psu11', name: '1000W 80+ Gold', price: 149 },
  ],
  fans: [
    { id: 'fan0', name: 'None — Stock fans only', price: 0 }, { id: 'fan2', name: '+3 ARGB Fans', price: 45 },
  ],
  os: [
    { id: 'os2', name: 'Ubuntu Linux', price: 0 }, { id: 'os3', name: 'Windows 11 Home', price: 99 },
  ],
};

function buildAdvisorSystemPrompt() {
  const catalogLines = Object.entries(ADVISOR_CATALOG).map(([cat, items]) =>
    `${cat}: ` + items.map(i => `${i.id}=${i.name} ($${i.price}${i.tier ? ', ' + i.tier : ''})`).join('; ')
  ).join('\n');

  return `You are the Build Advisor for RedGear PC Builds, a custom PC retailer. You help customers pick parts and understand what performance to expect.

REAL CATALOG (only recommend part IDs from this list — never invent a part or price):
${catalogLines}

Your job:
1. Answer the customer's question directly and conversationally — budget recommendations, "will X run at Y fps" questions, upgrade advice, comparisons, whatever they ask.
2. When asked about game performance, give specific estimated FPS ranges (e.g. "roughly 90-110 fps at 1080p high settings, 60-75 fps at 1440p") based on your general knowledge of how that CPU/GPU tier performs. ALWAYS state clearly that these are estimates based on typical benchmarks for similar hardware, not guaranteed numbers, since actual FPS varies by game settings, drivers, and other factors.
3. When you recommend a specific set of parts (not just answering a performance question about parts they already have), end your reply with a fenced block in this exact format so the site can offer to apply it — include ONLY categories you're actually recommending, using real IDs from the catalog above:
\`\`\`json
{"picks": {"cpu": "cpu6", "gpu": "gpu8", "ram": "ram6", "storage": "sto6"}}
\`\`\`
   Omit this block entirely if you're just answering a question (like an FPS estimate about their current build) rather than proposing a build.
4. Keep replies focused and skimmable — short paragraphs or a few bullet points, not an essay.
5. Stay in scope: PC hardware, performance, and this store's catalog. If asked something unrelated, briefly redirect to how you can help with their build.`;
}

const advisorLimiter = rateLimit({ windowMs: 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false });

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_before_deploying'; // set a real secret via env var in production
const SALT_ROUNDS = 12;

// ---- CORS: replace with your actual frontend domain before deploying ----
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*', // e.g. 'https://your-redgear-domain.com'
  credentials: true,
}));
app.use(express.json());

// ---- Database setup ----
const db = new Database(path.join(__dirname, 'redgear.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    items_json TEXT NOT NULL,
    total REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    build TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ---- Rate limiting on auth endpoints (slows down brute-force attempts) ----
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// ---- Routes ----

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' });
  if (!isValidEmail(email || '')) return res.status(400).json({ error: 'Valid email is required.' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const info = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name.trim(), email.toLowerCase(), hash);
  const user = { id: info.lastInsertRowid, name: name.trim(), email: email.toLowerCase() };
  res.json({ token: signToken(user), user });
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!isValidEmail(email || '')) return res.status(400).json({ error: 'Valid email is required.' });

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get((email || '').toLowerCase());
  if (!row) return res.status(401).json({ error: 'No account found with that email.' });

  const ok = await bcrypt.compare(password || '', row.password_hash);
  if (!ok) return res.status(401).json({ error: 'Incorrect password.' });

  const user = { id: row.id, name: row.name, email: row.email };
  res.json({ token: signToken(user), user });
});

app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.sub);
  res.json({ ok: true });
});

app.delete('/api/auth/account', requireAuth, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.sub);
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  const row = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.sub);
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json({ user: row });
});

// ---- Orders (used to gate "verified purchase" reviews server-side) ----
app.post('/api/orders', requireAuth, (req, res) => {
  const { items, total } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items array required' });
  db.prepare('INSERT INTO orders (user_id, items_json, total) VALUES (?, ?, ?)')
    .run(req.user.sub, JSON.stringify(items), Number(total) || 0);
  res.json({ ok: true });
});

app.get('/api/orders/mine', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.sub);
  res.json({ orders: rows.map(r => ({ ...r, items: JSON.parse(r.items_json) })) });
});

// ---- Reviews (gated: must have a matching order on file) ----
app.post('/api/reviews', requireAuth, (req, res) => {
  const { build, rating, comment } = req.body || {};
  if (!build || !rating) return res.status(400).json({ error: 'build and rating are required' });

  const hasPurchased = db.prepare(`
    SELECT 1 FROM orders WHERE user_id = ? AND items_json LIKE ?
  `).get(req.user.sub, `%${build}%`);
  if (!hasPurchased) return res.status(403).json({ error: 'Only verified buyers can review this build.' });

  db.prepare('INSERT INTO reviews (user_id, build, rating, comment) VALUES (?, ?, ?, ?)')
    .run(req.user.sub, build, Number(rating), comment || '');
  res.json({ ok: true });
});

app.get('/api/reviews/:build', (req, res) => {
  const rows = db.prepare(`
    SELECT reviews.*, users.name as user_name FROM reviews
    JOIN users ON users.id = reviews.user_id
    WHERE build = ? ORDER BY created_at DESC
  `).all(req.params.build);
  res.json({ reviews: rows });
});

// ---- Build Advisor (real AI) ----
// The frontend sends the conversation so far, the customer's current part
// selections (for "will my build run X" questions), and any optional
// budget it parsed from the latest message. This endpoint does NOT trust
// any part IDs or prices from the client for its own reasoning — it only
// ever reasons over ADVISOR_CATALOG above.
app.post('/api/advisor', advisorLimiter, async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(501).json({ error: 'Advisor AI is not configured on this server (missing ANTHROPIC_API_KEY).' });
  }
  const { messages, currentPicks } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'messages array required' });
  }
  // Cap history sent to the model — keeps cost bounded and ignores anything
  // beyond a normal back-and-forth.
  const trimmed = messages.slice(-12).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 2000),
  }));

  let contextNote = '';
  if (currentPicks && typeof currentPicks === 'object' && Object.keys(currentPicks).length) {
    const lines = Object.entries(currentPicks).map(([cat, id]) => {
      const item = (ADVISOR_CATALOG[cat] || []).find(i => i.id === id);
      return item ? `${cat}: ${item.name}` : null;
    }).filter(Boolean);
    if (lines.length) contextNote = `\n\nThe customer's CURRENT builder selections are:\n${lines.join('\n')}`;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 700,
        system: buildAdvisorSystemPrompt() + contextNote,
        messages: trimmed,
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(502).json({ error: 'Advisor AI is temporarily unavailable.' });
    }
    const data = await response.json();
    const text = (data.content || []).map(block => block.text || '').join('');
    res.json({ reply: text });
  } catch (e) {
    console.error('Advisor error:', e);
    res.status(502).json({ error: 'Advisor AI is temporarily unavailable.' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`RedGear backend listening on port ${PORT}`));
