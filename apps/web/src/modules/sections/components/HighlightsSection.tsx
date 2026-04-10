import { HighlightsSection as HighlightsSectionType } from '../../../types/content';

export function HighlightsSection({ section }: { section: HighlightsSectionType }) {
  return (
    <section className="section-shell py-10 lg:py-16">
      <div className="mb-8 space-y-3">
        <p className="eyebrow">{section.eyebrow}</p>
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {section.items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="surface-card p-7">
              <div className="mb-5 inline-flex rounded-2xl bg-gold/20 p-3 text-clay">
                <Icon size={26} />
              </div>
              <h3 className="font-display text-2xl text-forest">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/70">{item.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
