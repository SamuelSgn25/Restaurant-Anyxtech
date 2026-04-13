import { AuthUser } from '../../types/management';

export type UtilityView = 'dashboard' | 'profile' | 'settings';

export function AccountMenu({
  user,
  open,
  onToggle,
  onSelect,
  onLogout
}: {
  user: AuthUser;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: UtilityView) => void;
  onLogout: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 font-display text-lg">
          {user.name.charAt(0)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block">{user.name}</span>
          <span className="block text-xs font-medium text-white/65">{user.role}</span>
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-3 w-56 rounded-[1.5rem] border border-white/15 bg-ink p-3 text-white shadow-2xl">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'profile', label: 'Mon profil' },
            { key: 'settings', label: 'Parametres' }
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key as UtilityView)}
              className="flex w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition hover:bg-white/10"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex w-full rounded-2xl bg-clay px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-wine"
          >
            Se deconnecter
          </button>
        </div>
      ) : null}
    </div>
  );
}
