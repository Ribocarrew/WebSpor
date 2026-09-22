import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Minimal logo per docs/design/brand.md */}
        <picture>
          <source srcset="/brand/logo-footer.webp" type="image/webp" />
          <img src="/brand/logo-footer.png" alt="" width="48" height="48" />
        </picture>

        {/* Sender tagline per brand.md */}
        <p className="footer-tagline">Tænk før du klikker, men klik.</p>

        {/* Sender information */}
        <p className="footer-meta">
          Et værktøj fra Sandboxmodellen af Jacob Witt-Larsen ·{' '}
          <a
            href="https://teknologivejlederen.dk"
            target="_blank"
            rel="noopener noreferrer"
          >
            teknologivejlederen.dk
          </a>
        </p>

        {/* Required links per information-architecture.md & brand.md */}
        <div className="footer-links">
          <a href="/privatliv" onClick={(e) => handleNav(e, '/privatliv')}>
            Privatliv
          </a>
          <span>·</span>
          <a
            href="https://github.com/Ribocarrew/WebSpor"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <span>·</span>
          <span>Version 1.0.0</span>
          <span>·</span>
          <a href="mailto:jaco227e@lollandskoler.dk">
            jaco227e@lollandskoler.dk
          </a>
        </div>
      </div>
    </footer>
  );
};
