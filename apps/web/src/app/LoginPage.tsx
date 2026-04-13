import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const demoAccounts = [
  { role: 'Super admin', email: 'superadmin@cactus.bj', password: 'SuperAdmin123!' },
  { role: 'Super admin 2', email: 'superadmin2@cactus.bj', password: 'SuperAdmin456!' },
  { role: 'Administrateur', email: 'admin@cactus.bj', password: 'Admin123!' },
  { role: 'Administrateur 2', email: 'admin2@cactus.bj', password: 'Admin456!' },
  { role: 'Serveur', email: 'server@cactus.bj', password: 'Server123!' },
  { role: 'Serveur 2', email: 'server2@cactus.bj', password: 'Server456!' },
  { role: 'Chef de cuisine', email: 'chef@cactus.bj', password: 'Chef123!' },
  { role: 'Caissier', email: 'cashier@cactus.bj', password: 'Cashier123!' }
];

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@cactus.bj');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/management" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      navigate((location.state as { from?: string } | null)?.from ?? '/management', {
        replace: true
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Connexion impossible');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="section-shell grid gap-10 py-16 lg:grid-cols-[1fr_1fr] lg:py-24">
      <section className="surface-card bg-forest p-8 text-white sm:p-10">
        <p className="eyebrow !text-gold/80">Espace de gestion</p>
        <h1 className="mt-3 font-display text-5xl leading-tight">
          Un dashboard metier pour la direction, la salle, la cuisine et la caisse.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-white/75">
          Choisissez un compte de demonstration pour explorer les differentes vues et permissions.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
              }}
              className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 text-left transition hover:bg-white/15"
            >
              <p className="font-semibold">{account.role}</p>
              <p className="mt-2 text-sm text-white/70">{account.email}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="surface-card p-8 sm:p-10">
        <p className="eyebrow">Connexion</p>
        <h2 className="mt-3 font-display text-4xl text-forest">Acceder au back office</h2>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-forest">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-forest/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-clay"
              type="email"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-forest">Mot de passe</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-forest/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-clay"
              type="password"
              required
            />
          </label>
          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white transition hover:bg-wine disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </section>
    </main>
  );
}
