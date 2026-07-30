import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = async () => {
    try {
      if (!posts.length) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const { data } = await api.get('/posts/feed');
      setPosts(data.feed || []);
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to load the feed.';
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Home</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Your Chirp feed</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Welcome back, {user?.username || 'friend'}. Share a thought or browse your community updates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadFeed()}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <CreatePost onCreated={loadFeed} />

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading feed...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          <div className="text-lg font-semibold text-slate-900">The feed is quiet right now.</div>
          <p className="mt-2">Start the conversation by creating the first post.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.post_id}
              post={post}
              currentUser={user}
              onRefresh={loadFeed}
              onDelete={(postId) => setPosts((current) => current.filter((item) => item.post_id !== postId))}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
