import { ContactSection as ContactSectionType } from '../../../types/content';

export function ContactSection({ section }: { section: ContactSectionType }) {
  return (
    <section className="section-shell py-10 lg:py-16">
      <div className="surface-card grid gap-8 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
        <div>
          <p className="eyebrow">{section.eyebrow}</p>
          <h2 className="section-title mt-3 text-3xl sm:text-4xl">{section.title}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">Adresse</p>
            <p className="mt-2 text-base leading-7 text-ink/75">{section.address}</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">Contact</p>
            <p className="mt-2 text-base leading-7 text-ink/75">{section.phone}</p>
            <p className="text-base leading-7 text-ink/75">{section.email}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">Horaires</p>
            <div className="mt-2 space-y-2 text-base leading-7 text-ink/75">
              {section.schedule.map((entry) => (
                <p key={entry}>{entry}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
