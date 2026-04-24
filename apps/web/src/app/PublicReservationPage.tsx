import { FormEvent, useState } from 'react';
import { SectionRenderer } from '../modules/sections/SectionRenderer';
import { siteContent } from '../content/site-content';
import { api } from '../lib/api';
import { User, Mail, Phone, Users, Calendar, MessageSquare, MapPin, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';

export function PublicReservationPage() {
  const page = siteContent.pages.find((entry) => entry.slug === '/reservation');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    guestName: '', 
    email: '', 
    phone: '', 
    guests: 2, 
    date: '2026-04-13T19:30', 
    notes: '', 
    preferredZone: 'Salle principale' 
  });
  const zones = ['Salle principale', 'Terrasse', 'VIP'];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true); 
    setError(null); 
    setSuccess(null);
    try {
      await api.createReservation({ ...form, date: new Date(form.date).toISOString() });
      setSuccess('Votre demande de réservation a bien été transmise. Un majordome vous contactera dans les plus brefs délais.');
      setForm({ 
        guestName: '', 
        email: '', 
        phone: '', 
        guests: 2, 
        date: '2026-04-13T19:30', 
        notes: '', 
        preferredZone: form.preferredZone 
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Échec de la transmission. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-[#fcfaf7]">
      {page?.sections.map((section, index) => <SectionRenderer key={`${section.type}-${index}`} section={section} />)}
      
      <section className="relative px-4 py-20 lg:py-32">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
           <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-forest/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          {success ? (
            <div className="surface-card p-12 text-center animate-in zoom-in-95 duration-500 max-w-2xl mx-auto border-emerald-500/20">
              <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <CheckCircle size={40} />
              </div>
              <h2 className="font-display text-4xl text-forest mb-4">Demande Reçue</h2>
              <p className="text-ink/60 text-lg leading-relaxed mb-8">{success}</p>
              <button 
                onClick={() => setSuccess(null)}
                className="px-10 py-4 rounded-full bg-forest text-white font-bold uppercase tracking-widest text-xs hover:bg-clay transition-all"
              >
                Nouvelle Réservation
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
              
              {/* Form Card */}
              <form className="bg-white/70 backdrop-blur-xl p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-white/40 ring-1 ring-forest/5" onSubmit={handleSubmit}>
                <div className="mb-12">
                   <div className="flex items-center gap-3 text-gold mb-3">
                      <Sparkles size={18} />
                      <span className="text-xs font-black uppercase tracking-[0.3em]">Réservation en ligne</span>
                   </div>
                   <h2 className="font-display text-5xl text-forest leading-tight">Votre table <br/><span className="text-forest/30 italic">vous attend.</span></h2>
                </div>
                
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="space-y-3 group">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-forest/40 ml-1 transition-colors group-focus-within:text-gold">
                      <User size={12} /> Nom complet
                    </label>
                    <input 
                      value={form.guestName} 
                      onChange={(e) => setForm({ ...form, guestName: e.target.value })} 
                      className="w-full bg-[#f8f5f0]/50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-gold transition-all duration-300 placeholder:text-forest/10" 
                      placeholder="M. Jean Dupont" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-3 group">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-forest/40 ml-1 transition-colors group-focus-within:text-gold">
                      <Phone size={12} /> Téléphone
                    </label>
                    <input 
                      value={form.phone} 
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                      className="w-full bg-[#f8f5f0]/50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-gold transition-all duration-300 placeholder:text-forest/10" 
                      placeholder="+229 01 .." 
                      required 
                    />
                  </div>

                  <div className="space-y-3 group sm:col-span-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-forest/40 ml-1 transition-colors group-focus-within:text-gold">
                      <Mail size={12} /> Adresse Email
                    </label>
                    <input 
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      className="w-full bg-[#f8f5f0]/50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-gold transition-all duration-300 placeholder:text-forest/10" 
                      placeholder="client@cactus.bj" 
                      type="email" 
                      required 
                    />
                  </div>

                  <div className="space-y-3 group">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-forest/40 ml-1 transition-colors group-focus-within:text-gold">
                      <Users size={12} /> Couverts
                    </label>
                    <input 
                      value={form.guests} 
                      onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} 
                      className="w-full bg-[#f8f5f0]/50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-gold transition-all duration-300" 
                      type="number" 
                      min="1" 
                      max="50" 
                      required 
                    />
                  </div>

                  <div className="space-y-3 group">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-forest/40 ml-1 transition-colors group-focus-within:text-gold">
                      <MapPin size={12} /> Zone souhaitée
                    </label>
                    <select 
                      value={form.preferredZone} 
                      onChange={(e) => setForm({ ...form, preferredZone: e.target.value })} 
                      className="w-full bg-[#f8f5f0]/50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-gold transition-all duration-300"
                    >{zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}</select>
                  </div>

                  <div className="space-y-3 group sm:col-span-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-forest/40 ml-1 transition-colors group-focus-within:text-gold">
                      <Calendar size={12} /> Date et Heure
                    </label>
                    <input 
                      value={form.date} 
                      onChange={(e) => setForm({ ...form, date: e.target.value })} 
                      className="w-full bg-[#f8f5f0]/50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 ring-gold transition-all duration-300" 
                      type="datetime-local" 
                      required 
                    />
                  </div>

                  <div className="space-y-3 group sm:col-span-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-forest/40 ml-1 transition-colors group-focus-within:text-gold">
                      <MessageSquare size={12} /> Notes particulières
                    </label>
                    <textarea 
                      value={form.notes} 
                      onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                      className="min-h-[120px] w-full bg-[#f8f5f0]/50 border-none rounded-2xl px-6 py-5 font-bold text-sm focus:ring-2 ring-gold transition-all duration-300 placeholder:text-forest/10" 
                      placeholder="Une occasion spéciale ? Un régime alimentaire ?" 
                    />
                  </div>
                </div>
                
                {error ? (
                  <div className="mt-8 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm font-bold flex items-center gap-3">
                     <div className="h-6 w-6 rounded-full bg-rose-200 flex items-center justify-center shrink-0">!</div>
                     {error}
                  </div>
                ) : null}
                
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="group relative mt-12 w-full h-20 rounded-full bg-forest text-white font-bold uppercase tracking-[0.2em] shadow-2xl shadow-forest/20 overflow-hidden transition-all hover:bg-clay hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 transition-all group-hover:h-full" />
                  <span className="relative z-10">{submitting ? 'Transmission au Maître d’hôtel...' : 'Confirmer ma Réservation'}</span>
                </button>
              </form>

              {/* Info Column */}
              <aside className="space-y-8 lg:pt-12">
                 <div className="bg-forest p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                    <ShieldCheck className="text-gold mb-6" size={40} />
                    <h3 className="font-display text-2xl mb-4">Politique d’accueil</h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-6">Pour garantir une expérience optimale, nous gardons votre table pendant 20 minutes après l'heure prévue.</p>
                    <div className="space-y-4">
                       <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                          <CheckCircle className="text-gold" size={16} /> Tenue Correcte Exigée
                       </div>
                       <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                          <CheckCircle className="text-gold" size={16} /> Validation Immédiate
                       </div>
                    </div>
                 </div>

                 <div className="p-10 border border-forest/5 bg-white rounded-[3rem] shadow-sm">
                    <h3 className="font-display text-xl text-forest mb-6">Conciergerie</h3>
                    <div className="space-y-6">
                       <div className="flex gap-4">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-sand flex items-center justify-center text-forest"><Phone size={16}/></div>
                          <div>
                             <p className="text-[10px] font-black text-forest/30 uppercase tracking-widest">Direct</p>
                             <p className="text-sm font-bold">+229 01 95 95 95</p>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-sand flex items-center justify-center text-forest"><Mail size={16}/></div>
                          <div>
                             <p className="text-[10px] font-black text-forest/30 uppercase tracking-widest">Email</p>
                             <p className="text-sm font-bold text-ink/70">le-cactus@cactus.bj</p>
                          </div>
                       </div>
                       <div className="rounded-[1.5rem] bg-sand/40 p-5">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-forest/35">Confirmation</p>
                          <p className="mt-3 text-sm leading-7 text-ink/70">
                            Chaque demande est revue par l'equipe du restaurant afin de confirmer l'horaire, la zone souhaitee et les besoins particuliers.
                          </p>
                       </div>
                    </div>
                 </div>
              </aside>

            </div>
          )}
        </div>
      </section>
    </main>
  );
}
