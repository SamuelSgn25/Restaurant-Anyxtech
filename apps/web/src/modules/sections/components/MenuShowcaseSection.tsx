import { useEffect, useState } from 'react';
import { MenuShowcaseSection as MenuShowcaseSectionType } from '../../../types/content';
import { api } from '../../../lib/api';
import { MenuCategory } from '../../../types/management';

export function MenuShowcaseSection({
  section
}: {
  section: MenuShowcaseSectionType;
}) {
  const [dynamicMenu, setDynamicMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.menu()
      .then(data => {
        setDynamicMenu(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load menu:', err);
        setLoading(false);
      });
  }, []);

  const categoriesToRender = dynamicMenu.length > 0 
    ? dynamicMenu 
    : section.categories;

  return (
    <section className="section-shell py-16 lg:py-24">
      <div className="mb-12 space-y-4 text-center">
        <p className="eyebrow">{section.eyebrow}</p>
        <h2 className="section-title">{section.title}</h2>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
           <p className="text-forest/40">Chargement de la carte...</p>
        </div>
      ) : (
        <div className="grid gap-10 xl:grid-cols-2">
          {categoriesToRender.map((category: any) => (
            <article key={category.category || category.title} className="surface-card p-10 lg:p-14">
              <h3 className="font-display text-4xl text-forest border-b border-forest/10 pb-6 mb-8">
                {category.category || category.title}
              </h3>
              {category.description && (
                <p className="mb-10 text-base italic text-ink/50">{(category as any).description}</p>
              )}
              <div className="space-y-10">
                {(category as any).items.filter((item: any) => item.available !== false).map((item: any) => (
                  <div
                    key={item.id || item.name}
                    className="group relative overflow-hidden rounded-[1.8rem] border border-forest/8 bg-sand/35 p-5"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="mb-5 h-48 w-full rounded-[1.4rem] object-cover"
                      />
                    ) : null}
                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="font-display text-2xl text-ink group-hover:text-gold transition-colors">{item.name}</h4>
                      <div className="flex-1 border-b border-dotted border-forest/20 mx-4" />
                      <span className="font-display text-xl font-bold text-clay">
                        {typeof item.price === 'number' ? item.price.toLocaleString('fr-FR') + ' FCFA' : item.price}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{item.description}</p>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {item.tags.map((tag: any) => (
                          <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))} 
        </div>
      )}
    </section>
  );
}
