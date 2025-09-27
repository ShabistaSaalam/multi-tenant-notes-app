// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Pre-hash passwords so we don't require a DB here
const passwordHash = bcrypt.hashSync('password', 10);

const users = [
  { email: 'admin@acme.test', password: passwordHash, role: 'Admin', tenant: 'acme' },
  { email: 'user@acme.test', password: passwordHash, role: 'Member', tenant: 'acme' },
  { email: 'admin@globex.test', password: passwordHash, role: 'Admin', tenant: 'globex' },
  { email: 'user@globex.test', password: passwordHash, role: 'Member', tenant: 'globex' }
];

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email: user.email, role: user.role, tenant: user.tenant }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// optional: return current user info
router.get('/me', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).end();
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    res.json({ user: { email: payload.email, role: payload.role, tenant: payload.tenant } });
  } catch {
    res.status(401).end();
  }
});

module.exports = router;
