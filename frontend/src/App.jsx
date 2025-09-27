import { useState } from 'react';
import Login from './Login';
import Notes from './Notes';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentView, setCurrentView] = useState('viewNotes');

  const handleSetToken = (jwt) => {
    setToken(jwt);
    localStorage.setItem('token', jwt);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-500 text-gray-900">
      <header className="flex justify-between items-center p-4 bg-blue-700 text-white shadow-md">
        <h1 className="text-2xl font-bold">Notes App</h1>
        {token && (
          <div className="flex items-center space-x-4">
            <select
              value={currentView}
              onChange={e => setCurrentView(e.target.value)}
              className="p-1 rounded-md text-white"
            >
              <option value="viewNotes" className="p-1 rounded-md text-black">View Notes</option>
              <option value="addNote" className="p-1 rounded-md text-black">Add Note</option>
              <option value="fetchNote" className="p-1 rounded-md text-black">Get Note by ID</option>
              <option value="inviteUser" className="p-1 rounded-md text-black">Invite User</option>
            </select>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 transition-colors text-white py-1 px-3 rounded-md"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="p-4">
        {!token ? (
          <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded-lg shadow-lg">
            <Login setToken={handleSetToken} />
          </div>
        ) : (
          <Notes token={token} currentView={currentView} />
        )}
      </main>
    </div>
  );
}

export default App;
