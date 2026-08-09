import React from 'react';
import { Reveal } from './Reveal';
import { IconCheck } from './LandingIcons';

export const DemoSection: React.FC = () => {
  return (
    <section className="mv-demo">
      <div className="mv-shell mv-section mv-demo-grid">
        <Reveal>
          <span className="mv-eyebrow">Your numbers, made simple</span>
          <h2 style={{ fontSize: 32, fontWeight: 800, margin: '16px 0' }}>
            A report you can actually read
          </h2>
          <p style={{ color: 'var(--mv-text-dim)', fontSize: 16 }}>
            No spreadsheets. No confusing charts. Just clear numbers that tell you how your shop is
            doing.
          </p>
          <div className="mv-demo-list">
            <div className="mv-demo-list-item">
              <span className="mv-demo-check">
                <IconCheck />
              </span>
              <div>
                <h4>Daily, weekly & monthly profit</h4>
                <p>See how your shop is doing at a glance.</p>
              </div>
            </div>
            <div className="mv-demo-list-item">
              <span className="mv-demo-check">
                <IconCheck />
              </span>
              <div>
                <h4>Know your best-selling product</h4>
                <p>So you always know what to restock first.</p>
              </div>
            </div>
            <div className="mv-demo-list-item">
              <span className="mv-demo-check">
                <IconCheck />
              </span>
              <div>
                <h4>Download or share any report</h4>
                <p>Send to your bank, your NGO, or a loan officer.</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mv-report-card">
            <div className="mv-report-head">
              <h4>This Week's Sales</h4>
              <span>Mon – Sun</span>
            </div>
            <div className="mv-bars">
              <div className="mv-bar" style={{ height: '48%' }} />
              <div className="mv-bar" style={{ height: '66%' }} />
              <div className="mv-bar" style={{ height: '40%' }} />
              <div className="mv-bar" style={{ height: '78%' }} />
              <div className="mv-bar" style={{ height: '58%' }} />
              <div className="mv-bar" style={{ height: '70%' }} />
              <div className="mv-bar mv-bar-today" style={{ height: '92%' }} />
            </div>
            <div className="mv-bars-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
            <div className="mv-report-foot">
              <div className="mv-report-foot-item">
                <span>Best day</span>
                <span>Sunday</span>
              </div>
              <div className="mv-report-foot-item">
                <span>Top product</span>
                <span>Rice, 50kg</span>
              </div>
              <div className="mv-report-foot-item">
                <span>Week profit</span>
                <span>₦96,400</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
