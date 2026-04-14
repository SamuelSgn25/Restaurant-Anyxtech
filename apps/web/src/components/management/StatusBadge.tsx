export function StatusBadge({ value }: { value: string }) {
  const palette: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    seated: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-rose-100 text-rose-800',
    draft: 'bg-slate-100 text-slate-700',
    sent_to_kitchen: 'bg-orange-100 text-orange-800',
    in_preparation: 'bg-violet-100 text-violet-800',
    ready: 'bg-emerald-500 text-white shadow-sm',
    served: 'bg-sky-100 text-sky-800',
    closed: 'bg-stone-200 text-stone-700',
    paid: 'bg-emerald-500 text-white shadow-sm',
    available: 'bg-emerald-500 text-white shadow-sm',
    occupied: 'bg-rose-500 text-white shadow-sm',
    reserved: 'bg-orange-500 text-white shadow-sm',
    cleaning: 'bg-slate-400 text-white shadow-sm'
  };

  const labels: Record<string, string> = {
    available: 'Libre',
    occupied: 'Occupee',
    reserved: 'Reservee',
    cleaning: 'Nettoyage',
    sent_to_kitchen: 'Cuisine',
    in_preparation: 'Preparation',
    ready: 'Pret',
    served: 'Servi',
    closed: 'Paye',
    paid: 'Paye',
    pending: 'Attente',
    confirmed: 'Confirme',
    seated: 'Installe',
    completed: 'Termine',
    cancelled: 'Annule'
  };

  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${palette[value] ?? 'bg-slate-100 text-slate-700'}`}>
      {labels[value] || value.replace(/_/g, ' ')}
    </span>
  );
}
