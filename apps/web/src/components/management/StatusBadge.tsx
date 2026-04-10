export function StatusBadge({ value }: { value: string }) {
  const palette: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    seated: 'bg-cyan-100 text-cyan-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-rose-100 text-rose-800',
    draft: 'bg-slate-100 text-slate-700',
    sent_to_kitchen: 'bg-orange-100 text-orange-800',
    in_preparation: 'bg-violet-100 text-violet-800',
    ready: 'bg-emerald-100 text-emerald-800',
    served: 'bg-sky-100 text-sky-800',
    closed: 'bg-stone-200 text-stone-700',
    paid: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${palette[value] ?? 'bg-slate-100 text-slate-700'}`}>
      {value.replace(/_/g, ' ')}
    </span>
  );
}
