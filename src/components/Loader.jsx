export default function Loader({ fullScreen = false }) {
  const wrapperClass = fullScreen
    ? 'flex min-h-screen items-center justify-center'
    : 'flex items-center justify-center py-8';

  return (
    <div className={wrapperClass}>
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="h-3 w-3 animate-pulse rounded-full bg-slate-900" />
        <span className="text-sm font-medium text-slate-600">Loading...</span>
      </div>
    </div>
  );
}
