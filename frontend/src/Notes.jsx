import { useEffect, useState } from 'react';

const API_BASE = 'https://multi-tenant-notes-app-k15m-git-main-shabisthas-projects.vercel.app/api';

export default function Notes({ token, currentView }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [tenantPlan, setTenantPlan] = useState('FREE');
  const [tenantSlug, setTenantSlug] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [me, setMe] = useState(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteError, setInviteError] = useState('');
  const [users, setUsers] = useState([]);

  const [noteId, setNoteId] = useState('');
  const [fetchedNote, setFetchedNote] = useState(null);
  const [fetchNoteError, setFetchNoteError] = useState('');

  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  const fetchTenant = async () => {
    try {
      const res = await fetch(`${API_BASE}/tenant`, { headers: authHeaders() });
      if (!res.ok) throw await res.json();
      const data = await res.json();
      setTenantPlan(data.plan);
      setTenantSlug(data.slug);
    } catch (e) {
      console.error('fetchTenant', e);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_BASE}/notes`, { headers: authHeaders() });
      if (!res.ok) throw await res.json();
      const data = await res.json();
      setNotes(data);
    } catch (e) {
      console.error('fetchNotes', e);
    }
  };

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_BASE}/me`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setMe(data.user);
    } catch (e) {}
  };

  const fetchUsers = async () => {
    if (!tenantSlug) return;
    try {
      const res = await fetch(`${API_BASE}/users?tenant=${tenantSlug}`, { headers: authHeaders() });
      if (!res.ok) throw await res.json();
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error('fetchUsers', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchMe();
      await fetchTenant();
      await fetchNotes();
    };
    init();
  }, []);

  useEffect(() => {
    if (me?.role === 'Admin') {
      fetchUsers();
    }
  }, [me, tenantSlug]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (tenantPlan === 'FREE' && notes.length >= 3) {
      setError('Free plan limit reached. Upgrade to Pro for unlimited notes.');
      return;
    }

    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ title, content }),
    });

    const data = await res.json();
    if (res.ok) {
      setNotes(prev => [...prev, data]);
      setTitle('');
      setContent('');
    } else {
      setError(data.error || 'Failed to create note');
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) fetchNotes();
  };

  const handleUpgrade = async () => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/tenants/${tenantSlug}/upgrade`, { method: 'POST', headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        await fetchTenant();
        await fetchNotes();
        alert(`Tenant ${data.tenant.slug} upgraded to Pro!`);
      } else {
        setError(data.error || 'Upgrade failed');
      }
    } catch (e) {
      setError('Upgrade failed');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    try {
      const res = await fetch(`${API_BASE}/tenants/${tenantSlug}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`User ${data.user.email} invited successfully!`);
        setInviteEmail('');
        setInviteRole('Member');
        fetchUsers();
      } else {
        setInviteError(data.error || 'Invite failed');
      }
    } catch (e) {
      setInviteError('Invite failed');
    }
  };

  const startEdit = (note) => {
    setEditingNoteId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
  };

  const handleSaveEdit = async (id) => {
    setError('');
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ title: editingTitle, content: editingContent }),
    });
    const data = await res.json();
    if (res.ok) {
      setNotes(prev => prev.map(n => n.id === id ? data : n));
      setEditingNoteId(null);
    } else {
      setError(data.error || 'Update failed');
    }
  };

  const handleFetchNote = async () => {
    setFetchNoteError('');
    setFetchedNote(null);
    if (!noteId) return;
    try {
      const res = await fetch(`${API_BASE}/notes/${noteId}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        setFetchedNote(data);
      } else {
        setFetchNoteError(data.error || 'Note not found');
      }
    } catch (e) {
      setFetchNoteError('Error fetching note');
    }
  };

  const isUpgradeVisible = tenantPlan === 'FREE' && notes.length >= 3;
  const isAdmin = me?.role === 'Admin';

  return (
    <div className="max-w-3xl mx-auto my-10 px-4">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">
        Tenant: {tenantSlug} — Plan: {tenantPlan}
      </h2>

      {/* SHOW ONLY SELECTED SECTION */}
      {currentView === 'addNote' && (
        <>
          <form onSubmit={handleCreate} className="space-y-3 mb-6">
            <input
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={isUpgradeVisible}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Content"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              disabled={isUpgradeVisible}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isUpgradeVisible}
              className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Note
            </button>
            {isUpgradeVisible && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 mb-2">Free plan limit reached. Upgrade to Pro for unlimited notes.</p>
                <button onClick={handleUpgrade} className="bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            )}
          </form>
        </>
      )}

      {currentView === 'viewNotes' && (
        <ul className="space-y-4">
          {notes.map(n => (
            <li key={n.id} className="border rounded-md p-4 bg-white shadow-sm">
              {editingNoteId === n.id ? (
                <div className="space-y-2">
                  <input
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(n.id)}
                      className="bg-blue-700 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="bg-gray-300 text-gray-800 py-1 px-3 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-blue-800 text-lg">{n.title}</h3>
                  <p className="text-gray-700 mb-2">{n.content}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(n)}
                      className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {currentView === 'inviteUser' && isAdmin && (
        <div className="mb-6 p-4 border border-gray-300 rounded-md bg-white shadow-sm">
          <h3 className="text-xl font-semibold text-blue-800 mb-3">Invite User</h3>
          <form onSubmit={handleInvite} className="space-y-3 mb-4">
            <input
              type="email"
              placeholder="Email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Invite
            </button>
          </form>
          {inviteError && <p className="text-red-600">{inviteError}</p>}

          <h4 className="text-lg font-semibold mt-4 mb-2">Tenant Users</h4>
          <ul className="list-disc list-inside space-y-1">
            {users.map(u => (
              <li key={u.email} className="text-gray-700">
                {u.email} — <span className="font-medium">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentView === 'fetchNote' && (
        <div className="mb-6 p-4 border border-gray-300 rounded-md bg-white shadow-sm">
          <h3 className="text-xl font-semibold text-blue-800 mb-3">Get Note by ID</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              placeholder="Note ID"
              value={noteId}
              onChange={e => setNoteId(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleFetchNote}
              className="bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Fetch
            </button>
          </div>
          {fetchNoteError && <p className="text-red-600">{fetchNoteError}</p>}
          {fetchedNote && (
            <div className="border p-3 rounded-md bg-gray-50">
              <h4 className="font-semibold text-blue-800">Title: {fetchedNote.title}</h4>
              <p className="text-gray-700">Content: {fetchedNote.content}</p>
              <p className="text-gray-500 text-sm">Author: {fetchedNote.author}</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-600 mb-4">{error}</p>}
    </div>
  );
}
