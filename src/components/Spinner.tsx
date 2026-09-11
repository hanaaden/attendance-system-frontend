export default function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-sm text-ink/60">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-board border-t-transparent" />
      {label}
    </div>
  );
}
