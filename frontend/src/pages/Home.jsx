import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-shell">
      <header className="home-header">
        <div className="brand-block">
          <div className="brand-mark">CC</div>
          <div>
            <div className="brand-name">Centralized City Platform</div>
            <div className="brand-sub">Civic service operations, modernized</div>
          </div>
        </div>
        <div className="home-actions">
          <Link to="/login" className="btn secondary">
            Sign in
          </Link>
          <Link to="/login" className="btn">
            Get started
          </Link>
        </div>
      </header>

      <main className="home-main">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="hero-badge">Trusted by modern civic teams</span>
            <h1>Report city issues clearly, track them fast, and keep every update visible.</h1>
            <p>
              A centralized platform for citizens, workers, and supervisors to collaborate on non-emergency city concerns with transparent status tracking and polished workflows.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn">
                Report an issue now
              </Link>
              <Link to="/register" className="btn secondary">
                Create account
              </Link>
            </div>
            <div className="hero-metrics">
              <div className="metric-card">
                <strong>24/7</strong>
                <span>Service visibility</span>
              </div>
              <div className="metric-card">
                <strong>100%</strong>
                <span>Trackable requests</span>
              </div>
              <div className="metric-card">
                <strong>Fast</strong>
                <span>Team coordination</span>
              </div>
            </div>
          </div>

          <div className="hero-preview">
            <div className="preview-card">
              <div className="preview-row">
                <span>Live requests</span>
                <span className="preview-pill">12 active</span>
              </div>
              <div className="preview-row">
                <span>Completed today</span>
                <strong>8</strong>
              </div>
              <div className="preview-row">
                <span>Pending review</span>
                <strong>4</strong>
              </div>
              <div className="preview-row">
                <span>Citizen feedback</span>
                <strong>96%</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section-card">
          <div className="section-heading">
            <div>
              <h2>Why teams rely on the platform</h2>
              <p>A clear operating system for service reporting and resolution.</p>
            </div>
          </div>
          <div className="features-grid">
            <article className="feature-card">
              <h3>Instant reporting</h3>
              <p>Submit issues in seconds with attachments and a guided experience that keeps context intact.</p>
            </article>
            <article className="feature-card">
              <h3>Real-time tracking</h3>
              <p>Follow each report from submission to completion with consistent status visibility for every stakeholder.</p>
            </article>
            <article className="feature-card">
              <h3>Multi-category coverage</h3>
              <p>Support for roads, sanitation, lighting, water, and public space concerns in one place.</p>
            </article>
            <article className="feature-card">
              <h3>Transparent collaboration</h3>
              <p>Reduce duplication, improve accountability, and share accurate progress across teams and citizens.</p>
            </article>
          </div>
        </section>

        <section className="section-card">
          <div className="section-heading">
            <div>
              <h2>How it works</h2>
              <p>A simple, polished journey from report to resolution.</p>
            </div>
          </div>
          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">1</div>
              <h3>Choose the issue</h3>
              <p>Select the problem type and share the context with a concise description.</p>
            </article>
            <article className="step-card">
              <div className="step-number">2</div>
              <h3>Attach evidence</h3>
              <p>Add images or supporting files so the right team can act quickly and confidently.</p>
            </article>
            <article className="step-card">
              <div className="step-number">3</div>
              <h3>Track the progress</h3>
              <p>Monitor every update from submission to completion in a streamlined dashboard.</p>
            </article>
            <article className="step-card">
              <div className="step-number">4</div>
              <h3>Close the loop</h3>
              <p>Leave feedback, confirm completion, and keep communication transparent.</p>
            </article>
          </div>
        </section>

        <section className="section-card">
          <div className="section-heading">
            <div>
              <h2>Common issue categories</h2>
              <p>Built to cover the everyday service requests that matter most.</p>
            </div>
          </div>
          <div className="categories-grid">
            <article className="category-card">
              <h3>Roads & infrastructure</h3>
              <p>Potholes, damaged sidewalks, flooding, and blocked routes.</p>
            </article>
            <article className="category-card">
              <h3>Sanitation & waste</h3>
              <p>Overflowing bins, illegal dumping, and missed collections.</p>
            </article>
            <article className="category-card">
              <h3>Lighting & utilities</h3>
              <p>Broken streetlights, water leaks, and power concerns.</p>
            </article>
            <article className="category-card">
              <h3>Public spaces</h3>
              <p>Graffiti, broken amenities, stray animals, and park issues.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        © 2026 Centralized City Problem Reporting Platform · Empowering citizens and modern service teams.
      </footer>
    </div>
  );
}

export default Home;