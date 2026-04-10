import { siteContent } from '../content/site-content';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-forest/10 bg-forest text-white">
      <div className="section-shell grid gap-6 py-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="font-display text-3xl">{siteContent.brand.name}</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-white/70">{siteContent.brand.tagline}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Architecture</p>
            <p className="mt-3 text-sm leading-7 text-white/70">{siteContent.brand.footerNote}</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Navigation</p>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              {siteContent.navigation.map((item) => (
                <p key={item.href}>{item.label}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
