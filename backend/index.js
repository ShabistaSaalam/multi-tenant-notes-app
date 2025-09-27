// index.js
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const tenantsRoutes = require('./routes/tenants');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);        // /api/login, /api/me
app.use('/api/notes', notesRoutes); // /api/notes...
app.use('/api', tenantsRoutes);     // /api/tenant & /api/tenants/:slug/upgrade

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
