import { FormEvent, useEffect, useMemo, useState } from 'react';
import { SectionRenderer } from '../modules/sections/SectionRenderer';
import { siteContent } from '../content/site-content';
import { api } from '../lib/api';
import { RestaurantTable } from '../types/management';
import { StatusBadge } from '../components/management/StatusBadge';

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
      <section className="section-shell grid gap-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <form className="surface-card p-8 sm:p-10" onSubmit={handleSubmit}>
          <p className="eyebrow">Reservation en ligne</p>
          <h2 className="mt-3 font-display text-4xl text-forest">Un formulaire clair pour reserver votre table</h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-ink/65">Choisissez votre moment, le nombre de couverts et la zone souhaitee. La demande arrive directement dans le dashboard du restaurant.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input value={form.guestName} onChange={(event) => setForm({ ...form, guestName: event.target.value })} className="rounded-[1.2rem] border border-forest/15 px-4 py-3" placeholder="Nom complet" required />
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="rounded-[1.2rem] border border-forest/15 px-4 py-3" placeholder="Telephone" required />
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="rounded-[1.2rem] border border-forest/15 px-4 py-3" placeholder="Email" type="email" required />
            <input value={form.guests} onChange={(event) => setForm({ ...form, guests: Number(event.target.value) })} className="rounded-[1.2rem] border border-forest/15 px-4 py-3" type="number" min="1" max="20" required />
            <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="rounded-[1.2rem] border border-forest/15 px-4 py-3 sm:col-span-2" type="datetime-local" required />
            <select value={form.preferredZone} onChange={(event) => setForm({ ...form, preferredZone: event.target.value })} className="rounded-[1.2rem] border border-forest/15 px-4 py-3 sm:col-span-2">
              {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
            </select>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="min-h-32 rounded-[1.2rem] border border-forest/15 px-4 py-3 sm:col-span-2" placeholder="Allergies, occasion speciale, preference precise d emplacement..." />
          </div>
          {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}
          {success ? <p className="mt-4 text-sm font-medium text-emerald-700">{success}</p> : null}
          <button type="submit" disabled={submitting} className="mt-5 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink disabled:opacity-70">{submitting ? 'Envoi...' : 'Envoyer ma reservation'}</button>
        </form>

        <div className="space-y-6">
          <section className="surface-card p-8">
            <p className="eyebrow">Plan visuel des zones</p>
            <h2 className="mt-3 font-display text-4xl text-forest">Choisissez l ambiance qui vous convient</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">{zones.map((zone) => <button key={zone} type="button" onClick={() => setForm({ ...form, preferredZone: zone })} className={['rounded-[1.5rem] border p-4 text-left transition', form.preferredZone === zone ? 'border-clay bg-clay/10' : 'border-forest/10 hover:border-clay/40'].join(' ')}><p className="font-semibold text-forest">{zone}</p><p className="mt-2 text-sm text-ink/60">{tables.filter((table) => table.zone === zone).length} tables visibles</p></button>)}</div>
          </section>
          <section className="surface-card p-8">
            <p className="eyebrow">Disponibilites</p>
            <div className="mt-5 space-y-3">{tables.map((table) => <article key={table.id} className="rounded-[1.3rem] border border-forest/10 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-forest">{table.label}</p><p className="mt-1 text-sm text-ink/60">{table.zone} · {table.seats} couverts</p></div><StatusBadge value={table.status} /></div></article>)}</div>
          </section>
        </div>
      </section>
    </main>
  );
}
