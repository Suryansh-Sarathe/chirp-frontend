import { motion } from 'motion/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.username || !form.email || !form.password) {
      toast.error('Please fill out every field.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/auth/signup', form);
      toast.success('Account created. You can sign in now.');
      navigate('/login');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to create an account right now.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Join Chirp</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Start sharing posts and following other people right away.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">Username</span>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              placeholder="yourname"
              autoComplete="username"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link to="/login" className="font-medium text-slate-900 hover:text-slate-700">
            Sign in instead
          </Link>
          <Link to="/" className="font-medium text-slate-500 hover:text-slate-700">
            Back home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
