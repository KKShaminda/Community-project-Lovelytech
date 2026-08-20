import { ChevronDown, Heart, Search, ShoppingCart } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const wishlistItems = [
  {
    id: 1,
    name: '2000mAh Portable Power Bank - Fast Charge',
    price: 12400,
    rating: 5,
    sold: 203,
    image:
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: '7-in-1 USB-C Hub Multi-Port Adapter',
    price: 3400,
    rating: 4,
    sold: 102,
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Google Pixel 7 Pro (128 GB) - Used Mobile',
    price: 78400,
    rating: 5,
    sold: 8,
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    name: 'RGB Mechanical Gaming Keyboard',
    price: 6650,
    rating: 4,
    sold: 445,
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    name: 'Water Proof Bluetooth Speaker - 360° Sounds',
    price: 4300,
    rating: 5,
    sold: 312,
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    name: 'Ergonomic Wireless Mouse - Rechargeable',
    price: 2800,
    rating: 4,
    sold: 178,
    image:
      'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 7,
    name: 'Smart Fitness Watch - Health Tracker',
    price: 3200,
    rating: 5,
    sold: 89,
    image:
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 8,
    name: 'Premium Wireless Bluetooth Headphones',
    price: 2400,
    rating: 4,
    sold: 142,
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
  },
]

const formatPrice = (amount) => `Rs. ${amount.toLocaleString()}`

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-1 text-[#f2b400]">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < value ? 'text-[#f2b400]' : 'text-[#d1d5db]'}>
          ★
        </span>
      ))}
    </div>
  )
}

export function WishlistPage() {
  return (
    <Layout>
      <main className="min-h-screen bg-[#f4f3f2] px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px] rounded-[22px] bg-[#f8f4f3] px-3 py-4 shadow-[0_0_0_1px_rgba(0,0,0,0.02)] md:px-6 md:py-5">
          <div className="mb-7 flex flex-col gap-3 border-b border-[#e8d9d7] pb-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#E4342F] bg-white text-[#E4342F] shadow-sm">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-[#E4342F]">Wishlist</h1>
                <p className="text-sm text-[#6d6d6d]">Your saved items for later</p>
              </div>
            </div>

            <div className="text-xs font-medium text-[#3c3c3c] md:text-sm">
              <span className="text-[#828282]">Products</span>
              <span className="mx-2 text-[#999]">›</span>
              <span className="font-semibold text-[#3b3b3b]">Wishlist</span>
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-3 rounded-[20px] bg-[#f8eae9] p-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Products..."
                className="h-12 w-full rounded-[14px] border border-[#e7d2d2] bg-white px-4 pr-12 text-sm text-gray-700 placeholder:text-[#7e7e7e] outline-none focus:border-[#E4342F]"
              />
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#E4342F]" />
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <button className="rounded-[14px] border border-[#E4342F] bg-[#E4342F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
                All
              </button>
              <button className="flex items-center gap-2 rounded-[14px] border border-[#E4342F] bg-white px-4 py-2.5 text-sm font-semibold text-[#E4342F]">
                Category
                <ChevronDown className="h-4 w-4" />
              </button>
              <button className="flex items-center gap-2 rounded-[14px] border border-[#E4342F] bg-white px-4 py-2.5 text-sm font-semibold text-[#E4342F]">
                Date
                <ChevronDown className="h-4 w-4" />
              </button>
              <button className="flex items-center gap-2 rounded-[14px] border border-[#E4342F] bg-white px-4 py-2.5 text-sm font-semibold text-[#E4342F]">
                Stock Status
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {wishlistItems.map((item) => (
              <article
                key={item.id}
                className="rounded-[18px] border border-[#e7d8d8] bg-white p-2.5 shadow-[0_3px_10px_rgba(0,0,0,0.02)]"
              >
                <div className="relative mb-3 overflow-hidden rounded-[16px] bg-[#f2f2f2]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-48 w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#E4342F] shadow-sm"
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>

                <h3 className="mb-2 min-h-[48px] text-[15px] font-semibold leading-5 text-[#1f1f1f]">
                  {item.name}
                </h3>

                <div className="mb-2 flex items-center gap-2 text-[11px]">
                  <StarRating value={item.rating} />
                  <span className="text-[#666]">{item.sold} Sold</span>
                </div>

                <p className="mb-3 text-[17px] font-bold text-[#E4342F]">{formatPrice(item.price)}</p>

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#E4342F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d12a2a]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
              </article>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default WishlistPage
