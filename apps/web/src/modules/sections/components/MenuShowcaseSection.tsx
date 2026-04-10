import { MenuShowcaseSection as MenuShowcaseSectionType } from '../../../types/content';

export function MenuShowcaseSection({
  section
}: {
  section: MenuShowcaseSectionType;
}) {
  return (
    <section className="section-shell py-10 lg:py-16">
      <div className="mb-8 space-y-3">
        <p className="eyebrow">{section.eyebrow}</p>
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        {section.categories.map((category) => (
          <article key={category.title} className="surface-card p-8">
            <h3 className="font-display text-3xl text-forest">{category.title}</h3>
            <p className="mt-2 text-sm text-ink/60">{category.description}</p>
            <div className="mt-6 space-y-5">
              {category.items.map((item) => (
                <div
                  key={item.name}
                  className="border-b border-dashed border-forest/15 pb-4 last:border-none last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-ink">{item.name}</h4>
                    <span className="text-sm font-semibold text-clay">{item.price}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{item.description}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
