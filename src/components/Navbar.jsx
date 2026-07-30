import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Chirp
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'text-slate-900' : 'hover:text-slate-900')}
          >
            Home
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/explore"
                className={({ isActive }) => (isActive ? 'text-slate-900' : 'hover:text-slate-900')}
              >
                Explore
              </NavLink>

              <NavLink
                to={`/profile/${user.username}`}
                className={({ isActive }) => (isActive ? 'text-slate-900' : 'hover:text-slate-900')}
              >
                Profile
              </NavLink>
            </>
          )}
        </nav>

        {user ? (
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
