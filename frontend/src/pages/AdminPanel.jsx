import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const statusStyle = {
  'Open': 'bg-emerald-500/15 text-emerald-400',
  'In Progress': 'bg-blue-500/15 text-blue-400',
  'Completed': 'bg-gray-500/15 text-gray-400',
  'Cancelled': 'bg-red-500/15 text-red-400',
};

const AdminPanel = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, userRes] = await Promise.all([
        axiosInstance.get('/api/admin/helprequests', { headers }),
        axiosInstance.get('/api/admin/users', { headers }),
      ]);
      setRequests(reqRes.data);
      setUsers(userRes.data);
    } catch { alert('Failed to load admin data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await axiosInstance.delete(`/api/admin/helprequests/${id}`, { headers });
      setRequests(requests.filter(r => r._id !== id));
    } catch { alert('Failed to delete.'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      await axiosInstance.delete(`/api/admin/users/${id}`, { headers });
      setUsers(users.filter(u => u._id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete.'); }
  };

  const stats = [
    { label: 'Total Requests', value: requests.length, color: 'from-violet-600/30 to-indigo-600/30', icon: '📋' },
    { label: 'Open', value: requests.filter(r => r.status === 'Open').length, color: 'from-emerald-600/30 to-teal-600/30', icon: '🟢' },
    { label: 'In Progress', value: requests.filter(r => r.status === 'In Progress').length, color: 'from-blue-600/30 to-cyan-600/30', icon: '🔵' },
    { label: 'Total Users', value: users.length, color: 'from-amber-600/30 to-orange-600/30', icon: '👥' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          ⚡ Admin Panel
        </h1>
        <p className="text-gray-400">Full oversight of all community activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${s.color}`}>
            <div className="text-3xl mb-1">{s.icon}</div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 glass rounded-xl p-1 w-fit">
        {[
          { id: 'requests', label: `Requests (${requests.length})` },
          { id: 'users', label: `Users (${users.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-4xl mb-3 animate-pulse">⏳</div>
          <p>Loading...</p>
        </div>
      ) : tab === 'requests' ? (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req._id} className="glass-card rounded-2xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  {req.isUrgent && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">🚨 URGENT</span>}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">{req.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[req.status]}`}>{req.status}</span>
                </div>
                <h3 className="font-semibold text-white mb-1">{req.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-1">{req.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>📍 {req.location}</span>
                  <span>👤 {req.createdBy?.name} ({req.createdBy?.email})</span>
                  {req.volunteer && <span className="text-emerald-400">🤝 {req.volunteer.name}</span>}
                </div>
              </div>
              <button onClick={() => handleDeleteRequest(req._id)}
                className="btn-danger shrink-0 px-3 py-1.5 rounded-lg text-xs">
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map(u => (
            <div key={u._id} className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm">{u.name}</p>
                    {u.role === 'admin' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold">⚡ ADMIN</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{u.email}</p>
                  {u.address && <p className="text-xs text-gray-500 mt-0.5">📍 {u.address}</p>}
                </div>
              </div>
              {u._id !== user.id && u.role !== 'admin' && (
                <button onClick={() => handleDeleteUser(u._id)}
                  className="btn-danger px-3 py-1.5 rounded-lg text-xs">
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
