// data.js
// Single place to store in-memory test data so all routes share it.
module.exports = {
  // data.js
  tenants:[
    { slug: 'acme', plan: 'FREE', users: [{ email: 'admin@acme.test', role: 'Admin' }] },
    { slug: 'globex', plan: 'FREE', users: [{ email: 'admin@globex.test', role: 'Admin' }] }
  ],

  notes: [],

  // Optional: seed users used by auth route (see auth.js below)
  users: [
    // password hashed in auth.js using bcrypt during startup OR pre-hash here.
  ]
};
