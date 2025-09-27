// routes/notes.js
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { notes, tenants } = require('../data');

const router = express.Router();

// List notes for current tenant
router.get('/', requireAuth, (req, res) => {
  const tenantNotes = notes.filter(n => n.tenant === req.user.tenant);
  res.json(tenantNotes);
});

// Get single note
router.get('/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const note = notes.find(n => n.id === id && n.tenant === req.user.tenant);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// Create note (enforce plan)
router.post('/', requireAuth, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });

  const tenant = tenants.find(t => t.slug === req.user.tenant);
  const tenantNotes = notes.filter(n => n.tenant === req.user.tenant);

  if (tenant.plan === 'FREE' && tenantNotes.length >= 3) {
    return res.status(403).json({ error: 'Free plan limit reached. Upgrade to Pro for unlimited notes.' });
  }

  const id = notes.length ? Math.max(...notes.map(n => n.id)) + 1 : 1;
  const newNote = { id, title, content, tenant: req.user.tenant, author: req.user.email };
  notes.push(newNote);
  res.status(201).json(newNote);
});

// Update note
router.put('/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const note = notes.find(n => n.id === id && n.tenant === req.user.tenant);
  if (!note) return res.status(404).json({ error: 'Note not found' });

  const { title, content } = req.body;
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;

  res.json(note);
});

// Delete note
router.delete('/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = notes.findIndex(n => n.id === id && n.tenant === req.user.tenant);
  if (idx === -1) return res.status(404).json({ error: 'Note not found' });
  const removed = notes.splice(idx, 1)[0];
  res.json({ message: 'Deleted', note: removed });
});

module.exports = router;
