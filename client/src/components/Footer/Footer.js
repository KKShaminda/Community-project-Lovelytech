import React from 'react';
import './Footer.css';
import logo from '../../assets/images/Lovelytech-white.png';
import locationIcon from '../../assets/icons/location.svg';
import emailIcon from '../../assets/icons/email.svg';
import phoneIcon from '../../assets/icons/phone.svg';

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
            <li><img src={locationIcon} alt="location" className="icon" /> Thalgahawila Juction, Millewa, Horana</li>
            <li><img src={emailIcon} alt="email" className="icon" /> lovelytech.lk@gmail.com</li>
            <li><img src={phoneIcon} alt="phone" className="icon" /> +94 77 029 0008</li>
          </ul>
        </div>
      </div>

      <div className="lt-footer__bottom">
        <p>Copyright © 2025. All Rights Reserved by LovelyTech</p>
      </div>
    </footer>
  );
}
