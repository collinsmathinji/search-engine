'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/developers', label: 'Developers' },
  { href: '/repos', label: 'Repositories' },
  { href: '/pipeline', label: 'Pipeline' },
];

export function Header() {
  const pathname = usePathname();
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

  return (
    <header className="header" role="banner">
      <div className="container header__inner">
        <Link href="/" className="header__brand" aria-label="BountyLab Recruit home">
          <span className="header__brand-accent">BountyLab</span>
          <span className="header__brand-muted">Recruit</span>
        </Link>

        <nav className="header__nav" aria-label="Main navigation">
          {nav.map(({ href, label }) => {
            const isActive = getIsActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`header__link ${isActive ? 'header__link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="header__actions">
          <Link href="/developers" className="header__cta">
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
