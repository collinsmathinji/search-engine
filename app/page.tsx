import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <section className="hero container container--narrow">
        <div className="hero__tags">
          <span className="hero__tag">Full-text search</span>
          <span className="hero__tag">Semantic repos</span>
          <span className="hero__tag">Recruiter pipeline</span>
        </div>

        <h1 className="hero__title">
          <span>Find</span>
          <span className="hero__title-highlight">DEVELOPERS</span>
          <span>by skills & activity</span>
        </h1>

        <p className="hero__desc">
          Search the BountyLab graph. Full-text developer search, semantic repo discovery, and a recruiter pipeline. No interviews. Your criteria, your shortlist.
        </p>

        <div className="hero__actions">
          <Link href="/developers" className="btn btn--primary">
            Search developers
          </Link>
          <Link href="/repos" className="btn btn--secondary">
            Discover repositories
          </Link>
          <Link href="/pipeline" className="btn btn--secondary">
            View pipeline
          </Link>
        </div>

        <p className="hero__foot">
          Powered by <strong className="text-muted">BountyLab</strong>
        </p>
      </section>

      <section id="how-it-works" className="container container--medium page">
        <h2 className="section-title">How it works</h2>
        <p className="section-desc">
          Complete these steps to find and shortlist developers.
        </p>
        <div className="grid-3">
          <div className="step-card">
            <span className="step-card__icon">✓</span>
            <h3 className="step-card__title">Find developers</h3>
            <p className="step-card__text">
              Full-text search by name, bio, skills, company, or location. Filter by language, location, and activity.
            </p>
            <Link href="/developers" className="step-card__link">
              Search →
            </Link>
          </div>
          <div className="step-card">
            <span className="step-card__icon">✓</span>
            <h3 className="step-card__title">Discover repos</h3>
            <p className="step-card__text">
              Semantic search for repositories (e.g. “payment microservice in Go”). See contributors and pivot to developers.
            </p>
            <Link href="/repos" className="step-card__link">
              Repos →
            </Link>
          </div>
          <div className="step-card">
            <span className="step-card__icon">✓</span>
            <h3 className="step-card__title">Build pipeline</h3>
            <p className="step-card__text">
              Save candidates, add notes and tags, score with DevRank and activity. Export to CSV when ready.
            </p>
            <Link href="/pipeline" className="step-card__link">
              Pipeline →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
