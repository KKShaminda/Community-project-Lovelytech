import React from 'react';
import './Hero.css';
import bg from '../../../assets/images/Home1.png';
import logoWhite from '../../../assets/images/Lovelytech-white.png';

export default function Hero() {
  return (
    <section
      className="lt-hero"
      style={{ backgroundImage: `url(${bg})` }}
      aria-label="Lovely Tech hero"
    >
      <div className="lt-hero__overlay">
        <div className="lt-hero__content">
          <h1 className="lt-hero__title">
            Smart Solutions for Mobile &
            <br />
            PC Accessories and Repairs
          </h1>

          <div className="lt-hero__split" role="group" aria-label="Intro and description">
            <div className="lt-hero__brand">
              <img src={logoWhite} alt="Lovely Tech" className="lt-hero__logo" />
              <p className="lt-hero__tagline">Be lovely. Be Techy.</p>
            </div>

            <div className="lt-hero__copy">
              <p className="lt-hero__paragraph">
                Lovely Tech is dedicated to supporting our local community by providing reliable
                mobile and computer repair services, high-quality accessories, and smooth reseller
                partnerships. We work hard to ensure that everyone — from individual customers to
                business resellers — receives quick, transparent, and affordable tech solutions.
              </p>

              <div className="lt-hero__actions">
                <button className="lt-btn lt-cta-btn">Learn More &gt;&gt;</button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
