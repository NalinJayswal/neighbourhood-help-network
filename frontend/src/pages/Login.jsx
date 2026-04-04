import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/auth/login', formData);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="glass rounded-2xl w-full max-w-md p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-violet-500/25">
            🏘️
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm">Sign in to your community account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New to the network?{' '}
          <Link to="/register" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
            Create account
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-6 p-4 rounded-xl bg-white/3 border border-white/5">
          <p className="text-xs text-gray-500 font-medium mb-2">Demo Credentials</p>
          <div className="space-y-1 text-xs text-gray-400">
            <p>👑 Admin: <span className="text-violet-400">nalin@network.com</span> / <span className="text-violet-400">admin123</span></p>
            <p>👤 User: <span className="text-gray-300">jane@network.com</span> / <span className="text-gray-300">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
