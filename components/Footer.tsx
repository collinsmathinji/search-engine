import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="cluster">
          <span className="footer__tagline">Find developers by skills & activity</span>
        </div>
        <div className="cluster cluster--between" style={{ gap: '2rem' }}>
          <div>
            <p className="footer__col-title">Product</p>
            <ul className="footer__links">
              <li><Link href="/#how-it-works">How It Works</Link></li>
              <li><Link href="/developers">Developer search</Link></li>
              <li><Link href="/repos">Repository discovery</Link></li>
              <li><Link href="/pipeline">Pipeline</Link></li>
            </ul>
          </div>
          <div>
            <p className="footer__col-title">Company</p>
            <ul className="footer__links">
              <li><span className="text-muted">BountyLab Recruit</span></li>
            </ul>
          </div>
          <div>
            <p className="footer__col-title">Resources</p>
            <ul className="footer__links">
              <li><Link href="/developers">Search developers</Link></li>
              <li><Link href="/pipeline">Export CSV</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
