import React from 'react';
import './Brands.css';

// Explicit imports for brand icons (placed in client/src/assets/icons)
import appleIcon from '../../../assets/icons/apple.svg';
import samsungIcon from '../../../assets/icons/samsung.svg';
import lgIcon from '../../../assets/icons/lg.svg';
import xiaomiIcon from '../../../assets/icons/xiaomi.svg';
import vivoIcon from '../../../assets/icons/vivo.svg';
import huaweiIcon from '../../../assets/icons/huawei.svg';

const images = [
  { src: appleIcon, name: 'Apple' },
  { src: samsungIcon, name: 'Samsung' },
  { src: lgIcon, name: 'LG' },
  { src: xiaomiIcon, name: 'Xiaomi' },
  { src: vivoIcon, name: 'Vivo' },
  { src: huaweiIcon, name: 'Huawei' },
];

export default function Brands() {
  return (
    <section className="lt-brands" aria-label="brands">
      <hr className="lt-brands__divider" aria-hidden="true" />
      <div className="lt-brands__inner">
        <div className="lt-brands__grid">
          {images.map((img, i) => (
            <div className="lt-brands__item" key={img.name || i}>
              <img src={img.src} alt={`${img.name} logo`} className="lt-brands__img" />
            </div>
          ))}
        </div>
      </div>
      <hr className="lt-brands__divider" aria-hidden="true" />
    </section>
  );
}
