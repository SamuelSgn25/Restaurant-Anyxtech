import { FormEvent, useEffect, useMemo, useState } from 'react';
import { SectionRenderer } from '../modules/sections/SectionRenderer';
import { siteContent } from '../content/site-content';
import { api } from '../lib/api';
import { RestaurantTable } from '../types/management';

export function PublicReservationPage() {
  const page = siteContent.pages.find((entry) => entry.slug === '/reservation');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ guestName: '', email: '', phone: '', guests: 2, date: '2026-04-13T19:30', notes: '', preferredZone: 'Salle principale' });

  useEffect(() => { void api.publicTables().then(setTables).catch(() => setTables([])); }, []);
  const zones = useMemo(() => Array.from(new Set(tables.map((table) => table.zone))), [tables]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true); setError(null); setSuccess(null);
    try {
      await api.createReservation({ ...form, date: new Date(form.date).toISOString() });
      setSuccess('Votre demande de reservation a bien ete envoyee au restaurant.');
      setForm({ guestName: '', email: '', phone: '', guests: 2, date: '2026-04-13T19:30', notes: '', preferredZone: form.preferredZone });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Envoi impossible');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      {page?.sections.map((section, index) => <SectionRenderer key={`${section.type}-${index}`} section={section} />)}
      <section className="section-shell py-10 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <form className="surface-card p-8 sm:p-10" onSubmit={handleSubmit}>
            <p className="eyebrow">Reservation</p>
            <h2 className="mt-3 font-display text-4xl text-forest sm:text-5xl">Reserver Votre Moment</h2>
            <p className="mt-6 text-lg leading-8 text-ink/65">Indiquez vos coordonnees et preferences ci-dessous. Notre equipe vous contactera rapidement pour confirmer votre table.</p>
            
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-forest">Nom complet</label>
                <input value={form.guestName} onChange={(event) => setForm({ ...form, guestName: event.target.value })} className="w-full rounded-[1.2rem] border border-forest/15 px-4 py-3 focus:border-clay focus:ring-1 focus:ring-clay" placeholder="Ex: Jean Dupont" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-forest">Telephone</label>
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="w-full rounded-[1.2rem] border border-forest/15 px-4 py-3 focus:border-clay focus:ring-1 focus:ring-clay" placeholder="+229 ..." required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-forest">Email</label>
                <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-[1.2rem] border border-forest/15 px-4 py-3 focus:border-clay focus:ring-1 focus:ring-clay" placeholder="email@exemple.com" type="email" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-forest">Nombre de couverts</label>
                <input value={form.guests} onChange={(event) => setForm({ ...form, guests: Number(event.target.value) })} className="w-full rounded-[1.2rem] border border-forest/15 px-4 py-3 focus:border-clay focus:ring-1 focus:ring-clay" type="number" min="1" max="50" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-forest">Date et heure souhaitees</label>
                <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="w-full rounded-[1.2rem] border border-forest/15 px-4 py-3 focus:border-clay focus:ring-1 focus:ring-clay" type="datetime-local" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-forest">Zone preferee</label>
                <select value={form.preferredZone} onChange={(event) => setForm({ ...form, preferredZone: event.target.value })} className="w-full rounded-[1.2rem] border border-forest/15 px-4 py-3 focus:border-clay focus:ring-1 focus:ring-clay">
                  {zones.length > 0 ? zones.map((zone) => <option key={zone} value={zone}>{zone}</option>) : <option value="Salle principale">Salle principale</option>}
                  {!zones.includes('Terrasse') && <option value="Terrasse">Terrasse</option>}
                  {!zones.includes('VIP') && <option value="VIP">VIP</option>}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-forest">Notes ou demandes particulieres</label>
                <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="min-h-32 w-full rounded-[1.2rem] border border-forest/15 px-4 py-3 focus:border-clay focus:ring-1 focus:ring-clay" placeholder="Allergies, anniversaire, preference de table..." />
              </div>
            </div>
            
            {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}
            {success ? <p className="mt-4 text-sm font-medium text-emerald-700">{success}</p> : null}
            
            <button type="submit" disabled={submitting} className="mt-10 w-full rounded-full bg-forest py-5 text-base font-bold text-white shadow-xl transition hover:bg-clay disabled:opacity-70">
              {submitting ? 'Envoi en cours...' : 'Confirmer ma demande de reservation'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
