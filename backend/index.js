// index.js
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const tenantsRoutes = require('./routes/tenants');

const app = express();

// Enable CORS only for your deployed frontend
app.use(cors({
  origin: 'https://multi-tenant-notes-app-k15m-kj9f0ejq0-shabisthas-projects.vercel.app', 
  credentials: true
}));

app.use(express.json());

app.use('/api', authRoutes);        // /api/login, /api/me
app.use('/api/notes', notesRoutes); // /api/notes...
app.use('/api', tenantsRoutes);     // /api/tenant & /api/tenants/:slug/upgrade

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
