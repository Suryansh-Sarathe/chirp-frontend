import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function CommentSection({ postId, open }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    if (!postId) {
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/posts/${postId}/comments`);
      setComments(data.comments || []);
    } catch (error) {
      toast.error('Unable to load comments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, postId]);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      toast.error('Write a comment before sending.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/posts/${postId}/comments`, { content });
      setContent('');
      await loadComments();
      toast.success('Comment posted.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to post the comment.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a comment"
          className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? '...' : 'Reply'}
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-500">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.comment_id} className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
              <div className="text-sm font-semibold text-slate-900">{comment.username}</div>
              <div className="mt-1 text-sm text-slate-600">{comment.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
