import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function CreatePost({ onCreated }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      toast.error('Write something before posting.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/posts', { content });
      setContent('');
      toast.success('Post created.');
      if (onCreated) {
        await onCreated();
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to create the post.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows="4"
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
        placeholder="What is happening?"
      />

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">Share your latest update with the community.</span>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
