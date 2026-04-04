import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-lg shadow-lg">
            🏘️
          </div>
          <div>
            <p className="font-bold text-white leading-tight text-sm">Neighbourhood</p>
            <p className="text-xs text-violet-400 leading-tight font-medium">Help Network</p>
          </div>
        </Link>

        {/* Nav Links */}
        {user ? (
          <div className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-violet-600/30 text-violet-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Community
            </Link>
            <Link
              to="/my-requests"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/my-requests')
                  ? 'bg-violet-600/30 text-violet-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              My Requests
            </Link>
            <Link
              to="/profile"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/profile')
                  ? 'bg-violet-600/30 text-violet-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Profile
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-400/50 transition-all ml-1"
              >
                ⚡ Admin
              </Link>
            )}
            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-all font-medium">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary px-4 py-2 rounded-lg text-sm">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
