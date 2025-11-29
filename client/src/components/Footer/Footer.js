import React from 'react';

const Footer = () => {
  return (
    <footer style={{ padding: '1rem', textAlign: 'center', marginTop: 'auto', background: '#f1f1f1' }}>
      <div>© {new Date().getFullYear()} LovelyTech</div>
    </footer>
  );
};

export default Footer;
