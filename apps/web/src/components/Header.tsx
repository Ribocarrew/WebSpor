import React from 'react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand logo per docs/design/brand.md */}
        <a
          href="/"
          className="brand-link"
          onClick={(e) => handleNav(e, '/')}
          aria-label="WebSpor forside"
        >
          <picture>
            <source srcset="/brand/logo-header.webp" type="image/webp" />
            <img src="/brand/logo-header.png" alt="" width="56" height="56" />
          </picture>
          <span className="brand-name">WebSpor</span>
        </a>

        {/* Global navigation per information-architecture.md */}
        <nav className="main-nav" aria-label="Hovednavigation">
          <a
            href="/"
            className={`nav-item ${currentPath === '/' ? 'active' : ''}`}
            onClick={(e) => handleNav(e, '/')}
          >
            Undersøg
          </a>
          <a
            href="/demo"
            className={`nav-item ${currentPath === '/demo' ? 'active' : ''}`}
            onClick={(e) => handleNav(e, '/')}
          >
            Demo
          </a>
          <a
            href="/laer"
            className={`nav-item ${currentPath === '/laer' ? 'active' : ''}`}
            onClick={(e) => handleNav(e, '/')}
          >
            Lær
          </a>
          <a
            href="/metode"
            className={`nav-item ${currentPath === '/metode' ? 'active' : ''}`}
            onClick={(e) => handleNav(e, '/')}
          >
            Metode
          </a>
          <a
            href="/om"
            className={`nav-item ${currentPath === '/om' ? 'active' : ''}`}
            onClick={(e) => handleNav(e, '/')}
          >
            Om
          </a>
        </nav>
      </div>
    </header>
  );
};
