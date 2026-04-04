import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import HelpRequestForm from '../components/HelpRequestForm';

const CATEGORIES = ['All', 'Groceries', 'Pet Care', 'Transport', 'Garden', 'Childcare', 'Tech Help', 'Moving', 'Other'];

const categoryIcon = {
  'Groceries': '🛒', 'Pet Care': '🐾', 'Transport': '🚗', 'Garden': '🌿',
  'Childcare': '👶', 'Tech Help': '💻', 'Moving': '📦', 'Other': '💬',
};

const statusStyle = {
  'Open': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  'In Progress': 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  'Completed': 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
  'Cancelled': 'bg-red-500/15 text-red-400 border border-red-500/20',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = filter !== 'All' ? { category: filter } : {};
      const { data } = await axiosInstance.get('/api/helprequests', {
        headers: { Authorization: `Bearer ${user.token}` },
        params,
      });
      setRequests(data);
    } catch {
      console.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleVolunteer = async (id) => {
    try {
      await axiosInstance.patch(`/api/helprequests/${id}/volunteer`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to volunteer.');
    }
  };

  const openCount = requests.filter(r => r.status === 'Open').length;
  const urgentCount = requests.filter(r => r.isUrgent && r.status === 'Open').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Community Board
          </h1>
          <p className="text-gray-400">
            <span className="text-emerald-400 font-semibold">{openCount}</span> open requests
            {urgentCount > 0 && <span className="text-red-400 font-semibold ml-2">· {urgentCount} urgent</span>}
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <span className="text-lg">+</span> Post Request
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === cat
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                : 'glass text-gray-400 hover:text-white hover:border-violet-500/30'
            }`}>
            {cat !== 'All' && <span className="mr-1">{categoryIcon[cat]}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* Request Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-4xl mb-3 animate-pulse">⏳</div>
          <p>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-gray-400 text-lg">No requests found</p>
          <p className="text-gray-600 text-sm mt-1">Be the first to post one!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div key={req._id}
              className={`glass-card rounded-2xl p-5 ${req.isUrgent ? 'urgent-glow' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 flex items-center justify-center text-2xl shrink-0 border border-violet-500/20">
                    {categoryIcon[req.category] || '💬'}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {req.isUrgent && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse">
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

                    <h2 className="text-white font-semibold text-base mb-1 leading-snug">{req.title}</h2>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{req.description}</p>

                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                      <span>📍 {req.location}</span>
                      <span>📅 {new Date(req.dateNeeded).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>👤 {req.createdBy?.name}</span>
                      {req.volunteer && <span className="text-emerald-400">🤝 {req.volunteer.name} volunteered</span>}
                    </div>
                  </div>
                </div>

                {/* Volunteer Button */}
                {req.status === 'Open' && req.createdBy?._id !== user.id && !req.volunteer && (
                  <button onClick={() => handleVolunteer(req._id)}
                    className="shrink-0 btn-primary px-4 py-2 rounded-xl text-sm whitespace-nowrap">
                    Volunteer 🤝
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <HelpRequestForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchRequests(); }}
        />
      )}
    </div>
  );
};

export default Dashboard;
