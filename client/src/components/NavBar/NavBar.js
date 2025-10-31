import './NavBar.css';
import logo from '../../assets/images/Lovelytech-black.png';

export default function Navbar() {
  return (
    <header className="lt-navbar">
      <div className="lt-navbar__inner">
        <div className="lt-brand">
          <img src={logo} alt="Lovely Tech" className="lt-brand__logo" />
          <span className="lt-brand__name">Lovely Tech</span>
        </div>

        <nav className="lt-nav" aria-label="Main navigation">
          <a className="lt-nav__link" href="/">Home</a>
          <a className="lt-nav__link" href="/about">About Us</a>
          <a className="lt-nav__link" href="/products">Products</a>
          <a className="lt-nav__link" href="/services">Services</a>
          <a className="lt-nav__link" href="/contact">Contact Us</a>
        </nav>

        <div className="lt-actions">
          <button className="lt-btn lt-btn--outline">Sign In</button>
        </div>
      </div>
    </header>
  );
}
