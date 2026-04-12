import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <div className="premium-app">
      {/* Animated Background */}
      <div className="page-bg">
        <div className="bg-orb-3" />
      </div>
      <div className="grid-overlay" />

      {/* Navigation */}
      <nav className="premium-nav">
        <div className="nav-logo">
          <span className="logo-gradient">AskUni</span>
          <sup className="logo-badge">AI</sup>
        </div>
        <div className="nav-links">
          <Link href="#features" className="nav-link">Features</Link>
          <Link href="#how" className="nav-link">How it Works</Link>
          <ThemeToggle />
          <Link href="/login" className="btn-ghost" style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem' }}>Sign In</Link>
          <Link href="/register" className="btn-primary" style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem' }}>Get Started</Link>
        </div>
      </nav>

      <main className="premium-main">
        {/* ── HERO ── */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              RAG · Retrieval-Augmented Generation
            </div>

            <h1 className="hero-title">
              Your AI<br />
              <span className="text-gradient">University</span><br />
              Assistant
            </h1>

            <p className="hero-subtitle">
              Get instant, accurate answers about admissions, courses, fees, and
              campus policies at Apex Engineering College — powered by advanced
              AI with full source attribution.
            </p>

            <div className="hero-actions">
              <Link href="/register" className="btn-primary btn-primary-lg">
                Start Asking →
              </Link>
              <Link href="#features" className="btn-ghost btn-ghost-lg">
                Explore Features
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">2.58L</span>
                <span className="stat-label">B.Tech Fee/yr</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">15+</span>
                <span className="stat-label">Programs</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">99%</span>
                <span className="stat-label">Accuracy</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glass-card chat-preview-card">
              <div className="chat-preview-header">
                <div className="chat-preview-avatar">🤖</div>
                <div>
                  <div className="chat-preview-name">AskUni AI</div>
                  <div className="chat-preview-status">Online</div>
                </div>
              </div>
              <div className="chat-msg user">
                What is the academic fee for B.Tech CSE?
              </div>
              <div className="chat-msg bot bot-highlight">
                The annual academic fee for B.Tech CSE is{' '}
                <strong style={{ color: '#00d4ff' }}>₹2,58,000</strong>. The
                total first-year fee including one-time charges is ₹2,98,000.
                <div className="msg-source">
                  📄 fee_structure.txt · score 0.97
                </div>
              </div>
              <div className="chat-msg user" style={{ animationDelay: '1.3s' }}>
                What are the hostel options?
              </div>
              <div className="chat-msg bot" style={{ animationDelay: '1.8s' }}>
                On-campus hostels are available separately charged at ₹72,000/yr
                for AC and ₹55,000/yr for non-AC rooms…
                <div className="msg-source">
                  📄 admissions_policy.txt · score 0.91
                </div>
              </div>
            </div>
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="features-section">
          <div className="section-header">
            <span className="section-label">What we offer</span>
            <h2 className="section-title">
              Answers, not{' '}
              <span className="text-gradient">search results</span>
            </h2>
            <p className="section-subtitle">
              AskUni uses RAG to pull from verified university documents and
              synthesise precise, cited answers in seconds.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrap icon-blue">🎓</div>
              <h3 className="feature-title">Verified Accuracy</h3>
              <p className="feature-desc">
                Every answer is grounded in official Apex Engineering College
                documents — not hallucinated data. Confidence scores tell you
                exactly how sure the AI is.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap icon-cyan">⚡</div>
              <h3 className="feature-title">Instant Responses</h3>
              <p className="feature-desc">
                Stop scrolling through 50-page PDFs. Ask in natural language and
                get a structured answer in under 2 seconds using Mistral AI.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap icon-purple">🔍</div>
              <h3 className="feature-title">Source Citations</h3>
              <p className="feature-desc">
                Every response links the exact document and section it came from
                — so you can verify anytime, no questions asked.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap icon-green">🛡️</div>
              <h3 className="feature-title">Trusted Data Only</h3>
              <p className="feature-desc">
                Only official university documents are indexed. Admissions
                policies, fee structures, program details — all curated.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap icon-pink">💬</div>
              <h3 className="feature-title">Natural Language</h3>
              <p className="feature-desc">
                Ask like you'd ask a senior. "What's the minimum EAMCET rank for
                CSE?" Just type it — AskUni understands context.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap icon-blue">📊</div>
              <h3 className="feature-title">Admin Insights</h3>
              <p className="feature-desc">
                Admins can see failed queries, popular questions, and upload new
                documents to keep the knowledge base up to date.
              </p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="steps-section">
          <div className="section-header">
            <span className="section-label">How it works</span>
            <h2 className="section-title">
              Three steps to your{' '}
              <span className="text-gradient">answer</span>
            </h2>
          </div>
          <div className="steps-row">
            <div className="step-card">
              <div className="step-num">01</div>
              <h3 className="step-title">Ask your question</h3>
              <p className="step-desc">
                Type anything about fees, admissions, programs, or policies in
                plain language.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h3 className="step-title">AI retrieves context</h3>
              <p className="step-desc">
                Our RAG engine searches 100s of document chunks and ranks the
                most relevant ones.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h3 className="step-title">Get a cited answer</h3>
              <p className="step-desc">
                Mistral AI synthesises the retrieved context into a clear,
                sourced answer — with a confidence score.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="glass-card cta-card">
            <h2 className="cta-title">
              Ready to stop guessing?
            </h2>
            <p className="cta-sub">
              Join students who use AskUni to navigate Apex Engineering College
              without confusion. Free to use, powered by AI.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn-primary btn-primary-lg">
                Create Free Account →
              </Link>
              <Link href="/login" className="btn-ghost btn-ghost-lg">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="modern-footer" style={{ position: 'relative', zIndex: 1 }}>
        <div className="footer-logo">
          <span className="logo-gradient">AskUni</span>
          <sup className="logo-badge" style={{ fontSize: '0.45rem' }}>AI</sup>
        </div>
        <p className="footer-copy">
          © 2025 Apex Engineering College · AI-powered by Mistral RAG
        </p>
        <div className="footer-links">
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Terms</a>
          <Link href="/login" className="footer-link">Login</Link>
        </div>
      </footer>
    </div>
  );
}
