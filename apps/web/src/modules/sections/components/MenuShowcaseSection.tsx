import { MenuShowcaseSection as MenuShowcaseSectionType } from '../../../types/content';

export function MenuShowcaseSection({
  section
}: {
  section: MenuShowcaseSectionType;
}) {
  return (
    <section className="section-shell py-16 lg:py-24">
      <div className="mb-12 space-y-4 text-center">
        <p className="eyebrow">{section.eyebrow}</p>
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="grid gap-10 xl:grid-cols-2">
        {section.categories.map((category) => (
          <article key={category.title} className="surface-card p-10 lg:p-14">
            <h3 className="font-display text-4xl text-forest border-b border-forest/10 pb-6 mb-8">{category.title}</h3>
            <p className="mb-10 text-base italic text-ink/50">{category.description}</p>
            <div className="space-y-10">
              {category.items.map((item) => (
                <div
                  key={item.name}
                  className="group relative"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h4 className="font-display text-2xl text-ink group-hover:text-gold transition-colors">{item.name}</h4>
                    <div className="flex-1 border-b border-dotted border-forest/20 mx-4" />
                    <span className="font-display text-xl font-bold text-clay">{item.price}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70 max-w-[85%]">{item.description}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
