import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { siteContent } from '../content/site-content';
import { SectionRenderer } from '../modules/sections/SectionRenderer';
import { useAuth } from './AuthContext';
import { LoginPage } from './LoginPage';
import { ManagementPage } from './ManagementPage';

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

function ProtectedManagementRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <main className="section-shell py-20 text-center text-forest">Chargement...</main>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <ManagementPage />;
}

export function App() {
  return (
    <div className="min-h-screen text-ink">
      <SiteHeader />
      <Routes>
        {siteContent.pages.map((page) => (
          <Route key={page.slug} path={page.slug} element={<SitePage slug={page.slug} />} />
        ))}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/management" element={<ProtectedManagementRoute />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}
