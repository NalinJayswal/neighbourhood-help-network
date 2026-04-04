import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/auth/register', formData);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 right-20 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass rounded-2xl w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-emerald-500/25">
            🌱
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Join the Network</h1>
          <p className="text-gray-400 text-sm">Connect with your neighbours today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required
              placeholder="Jane Smith"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required
              placeholder="jane@example.com"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required
              placeholder="At least 6 characters"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Suburb / Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange}
              placeholder="e.g. Paddington, QLD"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 rounded-xl text-sm mt-2 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
