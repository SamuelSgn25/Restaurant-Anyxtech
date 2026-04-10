import { ReservationCtaSection as ReservationCtaSectionType } from '../../../types/content';

export function ReservationCtaSection({
  section
}: {
  section: ReservationCtaSectionType;
}) {
  return (
    <section className="section-shell py-10 lg:py-16">
      <div className="surface-card grid gap-8 overflow-hidden bg-forest px-8 py-10 text-white lg:grid-cols-[1fr_0.8fr] lg:px-12">
        <div>
          <p className="eyebrow !text-gold/80">{section.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">{section.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/75">{section.description}</p>
        </div>
        <ul className="space-y-4 rounded-[1.5rem] bg-white/10 p-6">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="border-b border-white/10 pb-3 text-sm last:border-none">
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
