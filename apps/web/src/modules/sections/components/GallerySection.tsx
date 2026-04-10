import { GallerySection as GallerySectionType } from '../../../types/content';

export function GallerySection({ section }: { section: GallerySectionType }) {
  return (
    <section className="section-shell py-10 lg:py-16">
      <div className="mb-8 space-y-3">
        <p className="eyebrow">{section.eyebrow}</p>
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {section.images.map((image) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            className="h-[320px] w-full rounded-[2rem] object-cover"
          />
        ))}
      </div>
    </section>
  );
}
