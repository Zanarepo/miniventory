import React from 'react';
import { Reveal } from './Reveal';

export const TestimonialSection: React.FC = () => {
  return (
    <section className="mv-section">
      <div className="mv-shell">
        <Reveal className="mv-testimonial">
          <p className="mv-testimonial-quote">
            "Before, I no know if I dey make profit or loss. Now, I check my phone before I close my
            shop, and I <span>see my real money.</span>"
          </p>
          <div className="mv-testimonial-person">
            <div className="mv-avatar">MN</div>
            <div className="mv-testimonial-person-info">
              <strong>Mama Ngozi</strong>
              <span>Vegetable Seller, Lagos</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
