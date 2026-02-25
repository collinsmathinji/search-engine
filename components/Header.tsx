'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/developers', label: 'Developers' },
  { href: '/repos', label: 'Repositories' },
  { href: '/pipeline', label: 'Pipeline' },
];

export function Header() {
  const pathname = usePathname();
  const isDevelopers = pathname.startsWith('/developers');

  return (
    <header className="header">
      <div className="container header__inner">
        <Link href="/" className="header__brand">
          <span className="header__brand-accent">BountyLab</span>
          <span className="text-muted">Recruit</span>
        </Link>

        <nav className="header__nav">
          <Link href="/#how-it-works" className="header__link">
            How it works
          </Link>
          {nav.map(({ href, label }) => {
            const isActive = href === pathname || (href === '/developers' && isDevelopers);
            return (
              <Link
                key={href}
                href={href}
                className={`header__link ${isActive ? 'header__link--active' : ''}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <Link href="/developers" className="btn btn--primary shrink-0">
          Dashboard
        </Link>
      </div>
    </header>
  );
}
