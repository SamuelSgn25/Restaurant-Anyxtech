import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        setSuccess('Mot de passe mis à jour avec succès.');
        setMode('login');
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center">
      {/* Overlay for branding colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1d18]/95 via-[#173126]/90 to-[#0f1d18]/95" />
      
      {/* Animated background highlights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-clay/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-[1100px] grid lg:grid-cols-2 gap-0 overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-md">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-white/5 border-r border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-gold text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} />
              Accès Privé Cactus
            </div>
            <h1 className="mt-8 font-display text-6xl text-white leading-tight">L'Excellence <br/>au bout <br/><span className="text-gold">des doigts.</span></h1>
            <p className="mt-6 text-white/60 text-lg leading-relaxed max-w-sm">
              Connectez-vous à votre interface de gestion premium pour piloter l'ensemble de votre établissement en temps réel.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-[#13261f] bg-sand flex items-center justify-center text-forest font-bold text-xs uppercase">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-white/40 text-sm italic">Plus de 15 collaborateurs connectés ce matin.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-12 lg:p-16 bg-white/10 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-10">
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-widest">Retour Site</span>
            </button>
            <img src="/logo-icon.png" alt="" className="h-8 w-8 opacity-50 grayscale invert" />
          </div>

          <div className="mb-10">
            <h2 className="font-display text-4xl text-white">
              {mode === 'login' ? 'Bienvenue' : 'Sécurité'}
            </h2>
            <p className="mt-2 text-white/50">
              {mode === 'login' ? 'Entrez vos identifiants pour continuer.' : 'Réinitialisez votre accès sécurisé.'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Adresse Email</label>
              <div className="relative group">
                <input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-white focus:bg-white/10 focus:border-gold/50 transition-all"
                  type="email" 
                  placeholder="nom@cactus.bj"
                  required 
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={20} />
              </div>
            </div>

            {mode === 'login' ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Mot de passe</label>
                  <button 
                    type="button"
                    onClick={() => setMode('password')}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 hover:text-gold transition-colors"
                  >
                    Oublié ?
                  </button>
                </div>
                <div className="relative group">
                  <input 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/5 border border-white/10 outline-none text-white focus:bg-white/10 focus:border-gold/50 transition-all"
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    required 
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={20} />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Ancien Mot de passe</label>
                  <input 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-14 px-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-white focus:bg-white/10 focus:border-gold/50 transition-all"
                    type="password" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Nouveau Mot de passe</label>
                  <input 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-14 px-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-white focus:bg-white/10 focus:border-gold/50 transition-all"
                    type="password" 
                    minLength={8}
                    required 
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-white/30 hover:text-white transition-colors"
                >
                  Annuler et revenir à la connexion
                </button>
              </div>
            )}

            {error ? (
              <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-sm font-medium animate-shake">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-sm font-medium">
                {success}
              </div>
            ) : null}

            <button 
              type="submit" 
              disabled={submitting} 
              className="group relative w-full h-16 rounded-2xl bg-gold text-forest font-bold uppercase tracking-widest transition-all hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 transition-all group-hover:h-full" />
              <span className="relative">{submitting ? 'Authentification...' : mode === 'login' ? 'Connexion Dashboard' : 'Confirmer le Changement'}</span>
            </button>
          </form>

          <p className="mt-8 text-center text-white/30 text-xs">
            © 2026 Hôtel Cactus. Tous droits réservés. Système de gestion sécurisé.
          </p>
        </div>
      </div>
    </main>
  );
}
