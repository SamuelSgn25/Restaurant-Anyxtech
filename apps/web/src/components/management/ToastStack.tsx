import { Bell, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  tone?: 'success' | 'info' | 'warning';
}

const toneClasses: Record<NonNullable<ToastItem['tone']>, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  info: 'border-forest/10 bg-white text-forest',
  warning: 'border-orange-200 bg-orange-50 text-orange-900'
};

const toneIcons = {
  success: CheckCircle2,
  info: Bell,
  warning: TriangleAlert
};

export function ToastStack({
  items,
  onDismiss
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-3">
      {items.map((item) => {
        const tone = item.tone ?? 'info';
        const Icon = toneIcons[tone] ?? Info;

        return (
          <div
            key={item.id}
            className={[
              'pointer-events-auto rounded-[1.5rem] border p-4 shadow-xl backdrop-blur animate-in slide-in-from-top-4 fade-in',
              toneClasses[tone]
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-white/70 p-2">
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-sm opacity-80">{item.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 transition hover:opacity-100"
              >
                Fermer
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
