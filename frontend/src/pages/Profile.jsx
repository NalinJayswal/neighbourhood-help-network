import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', university: '', address: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({ name: data.name, email: data.email, university: data.university || '', address: data.address || '' });
      } catch { setError('Failed to load profile.'); }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const { data } = await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      login({ ...user, ...data });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="glass rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg shadow-violet-500/25">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
          <p className="text-gray-400 text-sm mt-1">{user?.role === 'admin' ? '⚡ Administrator' : '👤 Community Member'}</p>
        </div>

        {success && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>}
        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Your full name' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'your@email.com' },
            { label: 'University / Organisation', name: 'university', type: 'text', placeholder: 'Optional' },
            { label: 'Suburb / Address', name: 'address', type: 'text', placeholder: 'e.g. Paddington, QLD' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">{field.label}</label>
              <input type={field.type} name={field.name} value={formData[field.name]}
                onChange={handleChange} placeholder={field.placeholder}
                className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 rounded-xl text-sm disabled:opacity-50 mt-2">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
