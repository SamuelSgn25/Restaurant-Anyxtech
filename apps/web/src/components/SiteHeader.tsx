import { Link, NavLink } from 'react-router-dom';
import { siteContent } from '../content/site-content';
import { useAuth } from '../app/AuthContext';

export function SiteHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-sand shadow-md">
      <div className="section-shell flex items-center justify-between py-4">
        <Link to="/" className="space-y-1 text-forest">
          <p className="font-display text-3xl font-semibold leading-none">
            {siteContent.restaurant.name}
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-clay font-bold">Hotel restaurant</p>
        </Link>
        <nav className="hidden gap-6 md:flex">
          {siteContent.pages.map((item) => (
            <NavLink
              key={item.slug}
              to={item.slug}
              className={({ isActive }) =>
                [
                  'text-sm font-bold transition',
                  isActive ? 'text-clay' : 'text-forest hover:text-clay'
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link
          to={user ? '/management' : '/login'}
          className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-wine"
        >
          {user ? 'Gestion' : 'Connexion'}
        </Link>
      </div>
    </header>
  );
}
