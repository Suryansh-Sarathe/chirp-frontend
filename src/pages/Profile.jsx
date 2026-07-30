import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ username: '', bio: '' });

  const isOwnProfile = currentUser?.username === username;

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileResponse = await api.get(`/users/${username}`);
      const profileData = profileResponse.data.user;

      const [postsResponse, followersResponse, followingResponse] = await Promise.all([
        api.get('/posts'),
        api.get(`/followers/${profileData.user_id}`),
        api.get(`/following/${profileData.user_id}`),
      ]);

      setProfile({
        ...profileData,
        follower_count: followersResponse.data.count || 0,
        following_count: followingResponse.data.count || 0,
      });
      setDraft({ username: profileData.username || '', bio: profileData.bio || '' });
      setPosts((postsResponse.data.posts || []).filter((post) => post.user_id === profileData.user_id));

      if (!isOwnProfile) {
        const followStatus = await api.get(`/follow/status/${profileData.user_id}`);
        setFollowing(followStatus.data.following || false);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to load the profile.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const onSaveProfile = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const { data } = await api.put('/users/me', { username: draft.username, bio: draft.bio });
      setProfile((current) => ({ ...current, ...data.user }));
      setEditing(false);
      toast.success('Profile updated.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update your profile.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onFollowToggle = async () => {
    if (!profile) {
      return;
    }

    try {
      setSubmitting(true);
      if (following) {
        await api.delete(`/follow/${profile.user_id}`);
        setFollowing(false);
        toast.success('Unfollowed successfully.');
      } else {
        await api.post(`/follow/${profile.user_id}`);
        setFollowing(true);
        toast.success('Followed successfully.');
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update follow status.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading profile...
      </div>
    );
  }

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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Profile</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{profile.username}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{profile.bio || 'No bio yet.'}</p>
          </div>

          {isOwnProfile ? (
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              {editing ? 'Cancel' : 'Edit profile'}
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={onFollowToggle}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {following ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Followers</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">{profile.follower_count ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Following</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">{profile.following_count ?? 0}</div>
          </div>
        </div>
      </div>

      {editing && isOwnProfile && (
        <form onSubmit={onSaveProfile} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Edit profile</h3>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">Username</span>
              <input
                value={draft.username}
                onChange={(event) => setDraft((current) => ({ ...current, username: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">Bio</span>
              <textarea
                value={draft.bio}
                onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
                rows="3"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Posts</h3>
        {posts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No posts yet for this profile.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {posts.map((post) => (
              <div key={post.post_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{profile.username}</div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
