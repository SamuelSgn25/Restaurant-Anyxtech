import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const demoAccounts = [
  { role: 'Super admin', email: 'superadmin@cactus.bj', password: 'SuperAdmin123!' },
  { role: 'Administrateur', email: 'admin@cactus.bj', password: 'Admin123!' },
  { role: 'Serveur', email: 'server@cactus.bj', password: 'Server123!' },
  { role: 'Chef de cuisine', email: 'chef@cactus.bj', password: 'Chef123!' },
  { role: 'Caissier', email: 'cashier@cactus.bj', password: 'Cashier123!' }
];

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'password'>('login');
  const [email, setEmail] = useState('admin@cactus.bj');
  const [password, setPassword] = useState('Admin123!');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/management" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate((location.state as { from?: string } | null)?.from ?? '/management', { replace: true });
      } else {
        const session = await api.login(email, currentPassword);
        await api.changePassword({ currentPassword, newPassword }, session.accessToken);
        setSuccess('Mot de passe mis a jour. Vous pouvez vous reconnecter.');
        setPassword(newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setMode('login');
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Operation impossible');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative overflow-hidden bg-[linear-gradient(135deg,#0f1d18_0%,#173126_34%,#efe3cf_34%,#f8f1e5_100%)] py-10 lg:min-h-[calc(100vh-6rem)] lg:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,162,94,0.28),transparent_22%),radial-gradient(circle_at_left,rgba(255,255,255,0.12),transparent_18%)]" />
      <div className="section-shell relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-white/80 to-clay" />
          <p className="eyebrow !text-gold/80">Back office premium</p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl leading-tight sm:text-6xl">Une connexion haut de gamme pour piloter le restaurant.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/74">Direction, salle, cuisine et caisse accedent ici a une experience plus executive, avec un niveau visuel digne d un logiciel de gestion premium.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">{demoAccounts.map((account) => <button key={account.email} type="button" onClick={() => { setEmail(account.email); setPassword(account.password); setCurrentPassword(account.password); setError(null); setSuccess(null); }} className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 text-left transition hover:bg-white/15"><p className="font-semibold">{account.role}</p><p className="mt-2 text-sm text-white/72">{account.email}</p></button>)}</div>
        </section>

        <section className="rounded-[2.5rem] border border-forest/10 bg-white/90 p-8 shadow-card backdrop-blur sm:p-10">
          <div className="mb-8 flex rounded-full bg-sand/85 p-1">
            {[{ key: 'login', label: 'Connexion' }, { key: 'password', label: 'Changer mon mot de passe' }].map((item) => <button key={item.key} type="button" onClick={() => { setMode(item.key as 'login' | 'password'); setError(null); setSuccess(null); }} className={['flex-1 rounded-full px-4 py-2 text-sm font-semibold transition', mode === item.key ? 'bg-forest text-white' : 'text-forest/70 hover:text-forest'].join(' ')}>{item.label}</button>)}
          </div>
          <p className="eyebrow">Acces securise</p>
          <h2 className="mt-3 font-display text-4xl text-forest">{mode === 'login' ? 'Entrer dans le dashboard' : 'Renouveler vos acces'}</h2>
          <p className="mt-3 text-base leading-7 text-ink/65">{mode === 'login' ? 'Connectez-vous pour piloter les reservations, le plan de salle, les commandes, la cuisine et la caisse.' : 'Validez votre mot de passe actuel, puis choisissez-en un nouveau pour votre compte.'}</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2"><span className="text-sm font-semibold text-forest">Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-[1.3rem] border border-forest/12 bg-sand/55 px-4 py-3 outline-none transition focus:border-clay" type="email" required /></label>
            {mode === 'login' ? <label className="block space-y-2"><span className="text-sm font-semibold text-forest">Mot de passe</span><input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-[1.3rem] border border-forest/12 bg-sand/55 px-4 py-3 outline-none transition focus:border-clay" type="password" required /></label> : <><label className="block space-y-2"><span className="text-sm font-semibold text-forest">Mot de passe actuel</span><input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-[1.3rem] border border-forest/12 bg-sand/55 px-4 py-3 outline-none transition focus:border-clay" type="password" required /></label><label className="block space-y-2"><span className="text-sm font-semibold text-forest">Nouveau mot de passe</span><input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-[1.3rem] border border-forest/12 bg-sand/55 px-4 py-3 outline-none transition focus:border-clay" type="password" minLength={8} required /></label></>}
            {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
            {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}
            <button type="submit" disabled={submitting} className="w-full rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white transition hover:bg-wine disabled:cursor-not-allowed disabled:opacity-70">{submitting ? 'Traitement...' : mode === 'login' ? 'Acceder a la gestion' : 'Mettre a jour le mot de passe'}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
