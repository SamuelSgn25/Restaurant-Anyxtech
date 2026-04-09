import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { siteContent } from '../content/site-content';
import { SectionRenderer } from '../modules/sections/SectionRenderer';

function SitePage({ slug }: { slug: string }) {
  const page = siteContent.pages.find((entry) => entry.slug === slug);

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return (
    <main>
      {page.sections.map((section, index) => (
        <SectionRenderer key={`${section.type}-${index}`} section={section} />
      ))}
    </main>
  );
}

export function App() {
  return (
    <div className="min-h-screen text-ink">
      <SiteHeader />
      <Routes>
        {siteContent.pages.map((page) => (
          <Route key={page.slug} path={page.slug} element={<SitePage slug={page.slug} />} />
        ))}
      </Routes>
      <SiteFooter />
    </div>
  );
}
