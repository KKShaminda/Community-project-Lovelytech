import React, { useState } from 'react';
import './NavBar.css';
import logo from '../../assets/images/Lovelytech-black.png';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="lt-navbar">
      <div className="lt-navbar__inner">
        <div className="lt-brand">
          <img src={logo} alt="Lovely Tech" className="lt-brand__logo" />
          <span className="lt-brand__name">Lovely Tech</span>
        </div>

        <button
          className={`lt-hamburger ${open ? 'is-open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          <span className="lt-hamburger__box">
            <span className="lt-hamburger__inner" />
          </span>
        </button>

        <nav className={`lt-nav ${open ? 'lt-nav--open' : ''}`} aria-label="Main navigation">
          <a className="lt-nav__link" href="/" onClick={() => setOpen(false)}>Home</a>
          <a className="lt-nav__link" href="/about" onClick={() => setOpen(false)}>About Us</a>
          <a className="lt-nav__link" href="/products" onClick={() => setOpen(false)}>Products</a>
          <a className="lt-nav__link" href="/services" onClick={() => setOpen(false)}>Services</a>
          <a className="lt-nav__link" href="/contact" onClick={() => setOpen(false)}>Contact Us</a>
          <div className="lt-actions lt-actions--mobile">
            <button className="lt-btn lt-btn--outline">Sign In</button>
          </div>
        </nav>

        <div className="lt-actions lt-actions--desktop">
          <button className="lt-btn lt-btn--outline">Sign In</button>
        </div>
      </div>
    </header>
  );
}
