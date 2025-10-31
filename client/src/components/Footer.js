import React from 'react';
import './Footer.css';
import logo from '../assets/Lovelytech-white.png';

export default function Footer() {
  return (
    <footer className="lt-footer">
      <div className="lt-footer__inner">
        <div className="lt-footer__col lt-footer__brand" align="center">
          <img src={logo} alt="Lovely Tech" className="lt-footer__logo" />
          <h2 className="lt-footer__title">Lovely Tech</h2>
        </div>

        <div className="lt-footer__col lt-footer__info" align="left">
          <h3><b>Info</b></h3>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/signup">Sign up</a></li>
          </ul>
        </div>

        <div className="lt-footer__col lt-footer__contact" align="left">
          <h3><b>Contact</b></h3>
          <ul className="lt-contact__list">
            <li><span className="icon">📍</span> Thalgahawila Juction, Millewa, Horana</li>
            <li><span className="icon">✉️</span> lovelytech.lk@gmail.com</li>
            <li><span className="icon">📞</span> +94 77 029 0008</li>
          </ul>
        </div>
      </div>

      <div className="lt-footer__bottom">
        <p>Copyright © 2025. All Rights Reserved by LovelyTech</p>
      </div>
    </footer>
  );
}
