import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Explore() {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const loadUsers = async (searchTerm = '') => {
    try {
      setLoading(true);
      const { data } = await api.get('/users', {
        params: searchTerm ? { search: searchTerm } : {},
      });

      const discoveredUsers = (data.users || []).filter((user) => user.user_id !== currentUser?.user_id);
      const usersWithFollowState = await Promise.all(
        discoveredUsers.map(async (user) => {
          try {
            const followResponse = await api.get(`/follow/status/${user.user_id}`);
            return { ...user, following: followResponse.data.following || false };
          } catch {
            return { ...user, following: false };
          }
        })
      );

      setUsers(usersWithFollowState);
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to load people to follow.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser?.user_id]);

  const onSearch = async (event) => {
    event.preventDefault();
    await loadUsers(query.trim());
  };

  const onFollowToggle = async (targetUser) => {
    try {
      setSubmittingId(targetUser.user_id);
      if (targetUser.following) {
        await api.delete(`/follow/${targetUser.user_id}`);
        setUsers((current) => current.map((user) => (user.user_id === targetUser.user_id ? { ...user, following: false } : user)));
        toast.success('Unfollowed successfully.');
      } else {
        await api.post(`/follow/${targetUser.user_id}`);
        setUsers((current) => current.map((user) => (user.user_id === targetUser.user_id ? { ...user, following: true } : user)));
        toast.success('Followed successfully.');
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update follow status.';
      toast.error(message);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Explore</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Find people to follow</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Search for friends or discover creators in your network.
            </p>
          </div>

          <form onSubmit={onSearch} className="flex w-full max-w-md gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by username"
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
            />
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading people...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          No people matched your search yet.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {users.map((user) => (
            <div key={user.user_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link to={`/profile/${user.username}`} className="text-lg font-semibold text-slate-900 hover:text-slate-700">
                    {user.username}
                  </Link>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{user.bio || 'No bio yet.'}</p>
                </div>

                <button
                  type="button"
                  disabled={submittingId === user.user_id}
                  onClick={() => onFollowToggle(user)}
                  className="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {user.following ? 'Unfollow' : 'Follow'}
                </button>
              </div>

              <div className="mt-4 text-sm text-slate-500">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
