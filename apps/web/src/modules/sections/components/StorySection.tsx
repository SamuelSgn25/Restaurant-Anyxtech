import { StorySection as StorySectionType } from '../../../types/content';

export function StorySection({ section }: { section: StorySectionType }) {
  return (
    <section className="section-shell grid gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
      <img
        src={section.image}
        alt={section.title}
        className="h-full min-h-[320px] w-full rounded-[2rem] object-cover"
      />
      <div className="surface-card p-8 sm:p-10">
        <p className="eyebrow">{section.eyebrow}</p>
        <h2 className="section-title mt-3 text-3xl sm:text-4xl">{section.title}</h2>
        <div className="mt-6 space-y-4 text-base leading-8 text-ink/90">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
