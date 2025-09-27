// routes/tenants.js
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { tenants, users } = require('../data'); // assume users array is here

const router = express.Router();

// GET /api/tenant  -> info for current user's tenant
router.get('/tenant', requireAuth, (req, res) => {
  const t = tenants.find(x => x.slug === req.user.tenant);
  if (!t) return res.status(404).json({ error: 'Tenant not found' });
  res.json(t);
});

// POST /api/tenants/:slug/upgrade  -> upgrade (Admin only)
router.post('/tenants/:slug/upgrade', requireAuth, (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Only Admin can upgrade the plan' });
  const tenant = tenants.find(t => t.slug === req.params.slug);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  tenant.plan = 'PRO';
  res.json({ message: `Tenant ${tenant.slug} upgraded to Pro`, tenant });
});

// POST /api/tenants/:slug/invite  -> invite new user (Admin only)
router.post('/tenants/:slug/invite', requireAuth, (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Only Admin can invite users' });

  const tenant = tenants.find(t => t.slug === req.params.slug);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ error: 'Email and role are required' });

  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = { email, role, tenant: tenant.slug, password: 'password' };
  users.push(newUser);

  res.json({ message: `User invited to ${tenant.slug}`, user: newUser });
});

// GET /api/users?tenant=slug -> get users of a tenant
router.get('/users', requireAuth, (req, res) => {
  const tenantSlug = req.query.tenant;
  if (!tenantSlug) return res.status(400).json({ error: 'tenant query param required' });

  const tenantUsers = users.filter(u => u.tenant === tenantSlug);
  res.json(tenantUsers);
});


module.exports = router;
