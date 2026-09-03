import React from 'react';

export const FooterSection: React.FC = () => {
  return (
    <footer className="mv-footer">
      <div className="mv-shell">
        <div className="mv-footer-grid">
          <div className="mv-footer-brand">
            <a href="/" className="mv-logo" aria-label="Miniventory home">
              <svg className="mv-logo-mark" viewBox="0 0 34 34" fill="none">
                <path
                  d="M17 2 30 9v16L17 32 4 25V9L17 2Z"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 2v15M17 17 4 9M17 17l13-8M17 17v15"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                <span className="mv-logo-mini">Mini</span>
                <span className="mv-logo-ventory">ventory</span>
              </span>
            </a>
            <p>
              Simple business record keeping for every entrepreneur - built for the realities of
              African small businesses.
            </p>
          </div>

          <div className="mv-footer-col">
            <h4>Product</h4>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
              {/* <li><a href="#pricing">Pricing</a></li> */}
            </ul>
          </div>

          <div className="mv-footer-col">
            <h4>Company</h4>
            <ul>
              {/* <li><a href="/about">About</a></li> */}
              {/* <li><a href="/contact">Contact Us</a></li> */}
              <li>
                <a href="/dashboard">Go to Dashboard</a>
              </li>
            </ul>
          </div>

          <div className="mv-footer-col">
            <h4>Languages</h4>
            <ul>
              <li>
                <a href="#">English</a>
              </li>
              <li>
                <a href="#">Pidgin</a>
              </li>
              <li>
                <a href="#">Igbo · Yoruba · Hausa</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mv-footer-bottom">
          <span>© {new Date().getFullYear()} Miniventory. Built for African entrepreneurs.</span>
          <span>Made for shops that never stop.</span>
        </div>
      </div>
    </footer>
  );
};
