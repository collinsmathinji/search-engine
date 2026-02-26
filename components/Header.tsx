'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/developers', label: 'Developers' },
  { href: '/repos', label: 'Repositories' },
  { href: '/pipeline', label: 'Pipeline' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDevelopers = pathname.startsWith('/developers');
  const isRepos = pathname.startsWith('/repos');
  const isPipeline = pathname.startsWith('/pipeline');

  const getIsActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/developers') return isDevelopers;
    if (href === '/repos') return isRepos;
    if (href === '/pipeline') return isPipeline;
    if (href === '/#how-it-works') return false;
    return pathname === href;
  };

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header
      className={`header ${menuOpen ? 'header--menu-open' : ''}`}
      role="banner"
    >
      <div className="container header__inner">
        <Link href="/" className="header__brand" aria-label="BountyLab Recruit home">
          <span className="header__brand-accent">BountyLab</span>
          <span className="header__brand-muted">Recruit</span>
        </Link>

        <button
          type="button"
          className="header__menu-btn"
          aria-expanded={menuOpen}
          aria-controls="header-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="header__menu-btn-bar" />
          <span className="header__menu-btn-bar" />
          <span className="header__menu-btn-bar" />
        </button>

        <nav
          id="header-nav"
          className="header__nav"
          aria-label="Main navigation"
        >
          {nav.map(({ href, label }) => {
            const isActive = getIsActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`header__link ${isActive ? 'header__link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={closeMenu}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="header__actions">
          <Link href="/developers" className="header__cta" onClick={closeMenu}>
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
