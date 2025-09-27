
# Multi-Tenant Notes App

A **multi-tenant Notes application** built with **React** (frontend) and a backend API. Supports multiple tenants (companies), role-based access, subscription limits, and note management.

---

## Features

### 1. Multi-Tenant Support
- Each tenant has its own notes and users.
- Admin users can invite other users to their tenant.
- Tenant plan (FREE or PRO) controls usage limits.

### 2. User Authentication
- JWT-based login.
- Tokens stored in `localStorage`.
- Logout functionality included.

### 3. Notes Management
- Add, view, edit, and delete notes.
- Fetch individual notes by ID.
- Free plan limited to 3 notes, Pro plan allows unlimited notes.

### 4. Role-Based Access
- **Admin** users:
  - Invite new users to the tenant.
  - View all tenant users.
- **Member** users:
  - Add/view/edit/delete their own notes.
  - Cannot invite users or upgrade the plan.

### 5. Plans
- **Free**: max 3 notes per tenant.
- **Pro**: unlimited notes, upgrade available via button.

---

## Technology Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: REST API (Node.js/Express)
- **Authentication**: JWT
- **Data Storage**: 
  - **In-Memory** by default (all data lost on server restart)
  - Can integrate **DynamoDB (DDB)** or other persistent DBs

---

## Installation & Setup

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/shabistasaalam/multi-tenant-notes-app.git
cd multi-tenant-notes
\`\`\`

2. **Install frontend dependencies**
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

3. **Backend setup**
- Start your backend server on `http://localhost:5000`
- Ensure the following API endpoints exist:
  - `/api/tenant`
  - `/api/notes`
  - `/api/users`
  - `/api/me`

4. **Login**
- Use a test user to get a JWT token.
- Token is stored in `localStorage`.

---

## Usage

- **View Notes**: See all notes for the tenant.
- **Add Note**: Add a new note (restricted by plan).
- **Get Note by ID**: Fetch a note using its ID.
- **Invite User**: Admins can invite new users to the tenant.

> Use the **dropdown menu in the header** to switch between these views.

---

## Storage Details

- Currently uses **in-memory storage** for notes and users:
  - Quick for demo/testing.
  - Data is lost if server restarts.
- Optional: Use **DynamoDB (DDB)** or other databases:
  - Replace in-memory arrays with DB queries.
  - API routes remain the same.

---

## Future Improvements

- Search & filter notes.
- Real-time collaboration.
- File attachments for notes.
- Persistent storage (DynamoDB, PostgreSQL, MongoDB).
- Unit & integration tests.
- UI enhancements.

---

## License

MIT License

---

## Author

**Shabista Saalam**  
Email: shabistasaalalm@gmail.com
