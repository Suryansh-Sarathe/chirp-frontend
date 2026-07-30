import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CommentSection from './CommentSection';

export default function PostCard({ post, currentUser, onRefresh, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content || '');

  const isOwner = useMemo(() => currentUser && currentUser.user_id === post.user_id, [currentUser, post.user_id]);

  const handleLike = async () => {
    try {
      if (liked) {
        await api.delete(`/posts/${post.post_id}/like`);
        setLiked(false);
      } else {
        await api.post(`/posts/${post.post_id}/like`);
        setLiked(true);
      }

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update the like state.';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      setIsUpdating(true);
      await api.delete(`/posts/${post.post_id}`);
      if (onDelete) {
        onDelete(post.post_id);
      }
      toast.success('Post deleted.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to delete the post.';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await api.put(`/posts/${post.post_id}`, { content: draft });
      setEditing(false);
      if (onRefresh) {
        await onRefresh();
      }
      toast.success('Post updated.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update the post.';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/profile/${post.username}`} className="text-sm font-semibold text-slate-900">
            {post.username}
          </Link>
          <p className="mt-1 text-xs text-slate-500">{new Date(post.created_at).toLocaleString()}</p>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isUpdating}
              className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows="3"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdating}
              className="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.content}</p>
      )}

      <div className="mt-5 flex items-center gap-3 text-sm text-slate-600">
        <button
          type="button"
          onClick={handleLike}
          className={`rounded-full px-3 py-2 font-medium transition ${liked ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          ♥ {post.like_count ?? 0}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((value) => !value)}
          className="rounded-full bg-slate-100 px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-200"
        >
          💬 {post.comment_count ?? 0}
        </button>
      </div>

      <CommentSection postId={post.post_id} open={showComments} />
    </motion.article>
  );
}
