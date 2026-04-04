import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import HelpRequestForm from '../components/HelpRequestForm';

const statusStyle = {
  'Open': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  'In Progress': 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  'Completed': 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
  'Cancelled': 'bg-red-500/15 text-red-400 border border-red-500/20',
};

const categoryIcon = {
  'Groceries': '🛒', 'Pet Care': '🐾', 'Transport': '🚗', 'Garden': '🌿',
  'Childcare': '👶', 'Tech Help': '💻', 'Moving': '📦', 'Other': '💬',
};

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/api/helprequests/mine', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRequests(data);
    } catch { alert('Failed to load your requests.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyRequests(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await axiosInstance.delete(`/api/helprequests/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRequests(requests.filter(r => r._id !== id));
    } catch { alert('Failed to delete.'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Requests</h1>
          <p className="text-gray-400">{requests.length} request{requests.length !== 1 ? 's' : ''} posted</p>
        </div>
        <button onClick={() => { setEditingRequest(null); setShowForm(true); }}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <span className="text-lg">+</span> New Request
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-4xl mb-3 animate-pulse">⏳</div>
          <p>Loading your requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-400 text-lg">No requests yet</p>
          <p className="text-gray-600 text-sm mt-1">Post your first help request to the community</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req._id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 flex items-center justify-center text-2xl shrink-0 border border-violet-500/20">
                    {categoryIcon[req.category] || '💬'}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {req.isUrgent && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                          🚨 URGENT
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                        {req.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[req.status]}`}>
                        {req.status}
                      </span>
                    </div>
                    <h2 className="text-white font-semibold mb-1">{req.title}</h2>
                    <p className="text-gray-400 text-sm line-clamp-2">{req.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                      <span>📍 {req.location}</span>
                      <span>📅 {new Date(req.dateNeeded).toLocaleDateString('en-AU')}</span>
                      {req.volunteer && <span className="text-emerald-400">🤝 {req.volunteer.name} volunteered</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => { setEditingRequest(req); setShowForm(true); }}
                    className="btn-warning px-4 py-1.5 rounded-lg text-xs">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(req._id)}
                    className="btn-danger px-4 py-1.5 rounded-lg text-xs">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <HelpRequestForm
          editingRequest={editingRequest}
          onClose={() => { setShowForm(false); setEditingRequest(null); }}
          onSuccess={() => { setShowForm(false); setEditingRequest(null); fetchMyRequests(); }}
        />
      )}
    </div>
  );
};

export default MyRequests;
