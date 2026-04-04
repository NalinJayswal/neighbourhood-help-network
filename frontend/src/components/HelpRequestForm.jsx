import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Groceries', 'Pet Care', 'Transport', 'Garden', 'Childcare', 'Tech Help', 'Moving', 'Other'];
const STATUSES = ['Open', 'In Progress', 'Completed', 'Cancelled'];

const HelpRequestForm = ({ editingRequest, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Other',
    location: '', dateNeeded: '', isUrgent: false, status: 'Open',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingRequest) {
      setFormData({
        title: editingRequest.title || '',
        description: editingRequest.description || '',
        category: editingRequest.category || 'Other',
        location: editingRequest.location || '',
        dateNeeded: editingRequest.dateNeeded ? new Date(editingRequest.dateNeeded).toISOString().split('T')[0] : '',
        isUrgent: editingRequest.isUrgent || false,
        status: editingRequest.status || 'Open',
      });
    }
  }, [editingRequest]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editingRequest) {
        await axiosInstance.put(`/api/helprequests/${editingRequest._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      } else {
        await axiosInstance.post('/api/helprequests', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingRequest ? '✏️ Edit Request' : '🌱 New Help Request'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {editingRequest ? 'Update your help request details' : 'Post a request to your community'}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required
              placeholder="e.g. Need help carrying groceries"
              className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={3}
              placeholder="Describe what help you need..."
              className="input-dark w-full px-4 py-2.5 rounded-xl text-sm resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange}
                className="input-dark w-full px-4 py-2.5 rounded-xl text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required
                placeholder="e.g. Paddington, QLD"
                className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Date Needed *</label>
              <input type="date" name="dateNeeded" value={formData.dateNeeded} onChange={handleChange} required
                className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            {editingRequest && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="input-dark w-full px-4 py-2.5 rounded-xl text-sm">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/20 transition-all">
            <input type="checkbox" name="isUrgent" checked={formData.isUrgent} onChange={handleChange}
              className="w-4 h-4 accent-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-200">🚨 Mark as urgent</p>
              <p className="text-xs text-gray-500">This will highlight your request at the top</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm glass text-gray-300 hover:text-white transition-all font-medium border border-white/10">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 btn-primary rounded-xl text-sm disabled:opacity-50">
              {loading ? 'Saving...' : editingRequest ? 'Update Request' : 'Post Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HelpRequestForm;
