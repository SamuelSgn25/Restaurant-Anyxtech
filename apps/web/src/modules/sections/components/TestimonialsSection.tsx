import { TestimonialsSection as TestimonialsSectionType } from '../../../types/content';

export function TestimonialsSection({
  section
}: {
  section: TestimonialsSectionType;
}) {
  return (
    <section className="section-shell py-10 lg:py-16">
      <div className="mb-8 space-y-3">
        <p className="eyebrow">{section.eyebrow}</p>
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {section.items.map((item) => (
          <article key={item.author} className="surface-card p-8">
            <p className="font-display text-3xl leading-10 text-forest">"{item.quote}"</p>
            <p className="mt-5 text-sm font-semibold text-clay">{item.author}</p>
            <p className="text-sm text-ink/80">{item.role}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
