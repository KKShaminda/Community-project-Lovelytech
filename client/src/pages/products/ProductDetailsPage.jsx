import {
  ArrowLeft,
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'

const productImages = [
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
]

const similarProducts = [
  {
    id: 1,
    name: '20,000mAh Portable Power Bank - Fast Charge',
    price: 12400,
    image:
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Smart Fitness Watch - Health Tracker',
    price: 3200,
    image:
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: '7-in-1 USB-C Hub Multi-Port Adapter',
    price: 3400,
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    name: 'Water Proof Bluetooth Speaker - 360° Sounds',
    price: 4300,
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
  },
]

const formatPrice = (amount) => `Rs. ${Number(amount).toLocaleString()}`

function RatingStars({ rating = 5 }) {
  return (
    <div className="flex items-center gap-1 text-[13px] text-[#f2b500]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < Math.round(rating) ? 'fill-current' : 'text-[#c9c9c9]'}`}
        />
      ))}
    </div>
  )
}

export function ProductDetailsPage() {
  const [selectedImage, setSelectedImage] = useState(productImages[0])
  const [quantity, setQuantity] = useState(1)
  const [liked, setLiked] = useState(false)

  const currentPrice = useMemo(() => 2400, [])

  return (
    <Layout>
      <main className="min-h-screen bg-[#f4f1ef] px-4 py-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-[1280px] rounded-[18px] bg-[#f9f7f6] p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] sm:p-6 lg:p-8">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#2f2f2f]">
            <button type="button" className="flex items-center gap-2 text-[#111827] hover:text-[#E4342F]">
              <ArrowLeft className="h-4 w-4" />
              Products
            </button>
          </div>

          <section className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[22px] border-[3px] border-[#E4342F] bg-[#0e0e10] p-2 shadow-sm">
                <img
                  src={selectedImage}
                  alt="Premium Wireless Bluetooth Headphone"
                  className="h-[420px] w-full rounded-[18px] object-cover sm:h-[500px]"
                />
              </div>

              <div className="flex justify-center gap-3 sm:justify-start">
                {productImages.map((image, index) => (
                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden rounded-[14px] border ${
                      selectedImage === image
                        ? 'border-[#E4342F] ring-2 ring-[#E4342F]/20'
                        : 'border-[#d0d0d0]'
                    }`}
                  >
                    <img src={image} alt={`Product view ${index + 1}`} className="h-20 w-20 object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="mb-3 flex items-start justify-between gap-4">
                <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#1c1c1c] sm:text-5xl">
                  Premium Wireless
                  <br />
                  Bluetooth Headphone
                </h1>

                <button
                  type="button"
                  onClick={() => setLiked((value) => !value)}
                  className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full border ${
                    liked ? 'border-[#E4342F] bg-[#E4342F] text-white' : 'border-[#E4342F] bg-white text-[#E4342F]'
                  }`}
                  aria-label="Add to wishlist"
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-[#4c4c4c]">
                <div className="flex items-center gap-2">
                  <RatingStars rating={5} />
                  <span className="font-semibold text-[#111827]">4.0</span>
                </div>
                <span className="text-[#8e8e8e]">2,478 Customer Reviews</span>
                <span className="inline-flex items-center rounded-full border border-[#7ccf94] bg-[#ebfff2] px-2.5 py-1 text-xs font-semibold text-[#1c8d46]">
                  In Stock
                </span>
              </div>

              <div className="mb-4 flex items-end gap-3">
                <div className="text-4xl font-black tracking-tight text-[#111111]">{formatPrice(currentPrice)}</div>
                <div className="mb-1 text-lg font-medium text-[#9b9b9b] line-through">Rs. 8,950</div>
                <div className="mb-1 text-sm font-semibold text-[#E4342F]">Save 15% Today</div>
              </div>

              <p className="mb-6 max-w-xl text-base leading-7 text-[#4f4f4f]">
                Elevate your audio with our next-generation wireless headphones. Experience
                breathtaking high-fidelity sound paired with industry-leading active noise
                cancellation. Designed for all-day comfort with ultra-soft ear cushions and a
                40-hour battery life. Your music, completely uninterrupted.
              </p>

              <div className="mb-6 grid gap-3 text-sm text-[#3f3f3f] sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#E4342F]" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#E4342F]" />
                  <span>6 Months Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-[#E4342F]" />
                  <span>30-Days Easy Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#E4342F]" />
                  <span>Secure Checkout</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center justify-between rounded-[12px] border border-[#d8d8d8] bg-[#f2f2f2] px-4 py-3 sm:w-[180px]">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-[#3a3a3a] hover:bg-white"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[30px] text-center text-lg font-bold text-[#1a1a1a]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-[#3a3a3a] hover:bg-white"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#E4342F] px-6 py-3 text-base font-semibold text-white shadow-[0_8px_18px_rgba(228,52,47,0.25)] transition hover:bg-[#d62d2d]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[18px] border border-[#e2d8d6] bg-[#f9f4f3] p-5">
              <h2 className="mb-3 text-[30px] font-black tracking-tight text-[#1d1d1d]">
                Unrivaled Sound Experience
              </h2>
              <p className="mb-6 text-base leading-7 text-[#4d4d4d]">
                Elevate your audio with our next-generation wireless headphones. Experience
                breathtaking high-fidelity sound paired with industry-leading active noise
                cancellation. Designed for all-day comfort with ultra-soft ear cushions and a
                40-hour battery life. Your music, completely uninterrupted.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[16px] border border-[#f0d6d3] bg-[#f9eceb] p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#E4342F]/10 text-[#E4342F]">
                    <ZapIcon />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-[#1c1c1c]">Fast Charging</h3>
                  <p className="text-sm leading-6 text-[#545454]">
                    Just 15 minutes of charging provides up to 5 hours of battery life.
                  </p>
                </div>

                <div className="rounded-[16px] border border-[#f0d6d3] bg-[#f9eceb] p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#E4342F]/10 text-[#E4342F]">
                    <ChipIcon />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-[#1c1c1c]">Hybrid ANC</h3>
                  <p className="text-sm leading-6 text-[#545454]">
                    Multi-microphone technology blocks out the noise without compromising
                    clarity.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e1d5d4] bg-[#f8f1f1] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[30px] font-black tracking-tight text-[#1c1c1c]">Customer Review</h2>
                <button type="button" className="flex items-center gap-1 text-sm font-semibold text-[#E4342F]">
                  Write a Review
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#f0e0da] text-sm font-bold text-[#5d2a1c]">
                  K
                </div>
                <div>
                  <div className="font-semibold text-[#1f1f1f]">Kaveesha Shaminda</div>
                  <div className="text-xs text-[#666]">2 days ago</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1 text-[#f2b500]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>

              <p className="mt-4 text-base leading-7 text-[#4f4f4f]">
                “The noise cancellation is actually better than my premium Bose set. The battery
                life is insane — I’ve used it for a week of commuting and haven’t charged once.
                The build quality feels really premium.”
              </p>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[30px] font-black tracking-tight text-[#1b1b1b]">You Might Also Like</h2>
              <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-[#E4342F]">
                View All Products
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {similarProducts.map((item) => (
                <article key={item.id} className="rounded-[18px] border border-[#e8dad9] bg-white p-2 shadow-sm">
                  <div className="relative mb-3 overflow-hidden rounded-[14px] bg-[#f5f5f5]">
                    <img src={item.image} alt={item.name} className="h-44 w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#E4342F] shadow-sm"
                      aria-label="Add to wishlist"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>

                  <h3 className="mb-2 min-h-[48px] text-[15px] font-semibold leading-5 text-[#1f1f1f]">
                    {item.name}
                  </h3>

                  <p className="text-[17px] font-bold text-[#E4342F]">{formatPrice(item.price)}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  )
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M13 2 4 13h5l-1 9 9-11h-5l1-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 4v4M15 4v4M4 9h16M4 15h16M9 16v4M15 16v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default ProductDetailsPage
