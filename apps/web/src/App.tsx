import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { DemoPage } from './pages/DemoPage.js';
import { ScanPage } from './pages/ScanPage.js';
import { MetodePage } from './pages/MetodePage.js';
import { LaerPage } from './pages/LaerPage.js';
import { PrivatlivPage } from './pages/PrivatlivPage.js';
import { OmPage } from './pages/OmPage.js';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [activeScanTarget, setActiveScanTarget] = useState<string>('');

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const handleStartScan = (targetUrl: string) => {
    setActiveScanTarget(targetUrl);
    navigate('/scan');
  };

  let pageContent: React.ReactNode = null;

  if (currentPath === '/demo') {
    pageContent = <DemoPage />;
  } else if (currentPath === '/scan') {
    pageContent = (
      <ScanPage
        targetUrl={activeScanTarget || 'https://skole.example'}
        onNavigate={navigate}
      />
    );
  } else if (currentPath === '/metode') {
    pageContent = <MetodePage />;
  } else if (currentPath === '/laer') {
    pageContent = <LaerPage />;
  } else if (currentPath === '/privatliv') {
    pageContent = <PrivatlivPage />;
  } else if (currentPath === '/om') {
    pageContent = <OmPage />;
  } else {
    pageContent = (
      <HomePage
        onStartScan={handleStartScan}
        onNavigate={navigate}
      />
    );
  }

  return (
    <div className="app-container">
      <a href="#main" className="skip-link">
        Gå direkte til hovedindhold
      </a>

      <Header currentPath={currentPath} onNavigate={navigate} />

      <main id="main" className="main-content" tabIndex={-1}>
        {pageContent}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
};
