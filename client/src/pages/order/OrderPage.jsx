import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import headphonesImg from '../../assets/headphone.png';
import keyboardImg from '../../assets/keyboard.png';
import powerbankImg from '../../assets/powerbank.png';
import Layout from '../../components/layout/Layout';
import {
  ArrowRightIcon,
  CheckIcon,
  ClipboardListIcon,
  PackageIcon,
  PackageSearchIcon,
  SearchIcon,
  ShoppingBagIcon,
  Trash2Icon,
  TruckIcon,
  XIcon,
} from 'lucide-react';


const STATUS_FLOW = ['Placed', 'Confirmed', 'Proceeded', 'Delivered'];

const STATUS_COPY = {
  Placed: { title: 'Order Placed', hint: 'Awaiting confirmation' },
  Confirmed: { title: 'Confirmed', hint: 'Pending your payment' },
  Proceeded: { title: 'Proceeded', hint: 'Handed to courier' },
  Delivered: { title: 'Delivered', hint: 'Arriving soon' },
};

const STATUS_BADGE = {
  Placed: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-sky-100 text-sky-700',
  Proceeded: 'bg-orange-100 text-orange-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
};

const IMG = {
  headphones: headphonesImg,
  keyboard: keyboardImg,
  powerbank: powerbankImg,
};


const ORDERS = [
  {
    id: 'ORD-15487956',
    placedAt: '@18:45 pm 10/12/2025',
    status: 'Placed',
    tags: ['Headphone', 'Keyboard', 'Power Bank'],
    shipping: 0,
    products: [
      { id: 'p1', name: 'Premium Wireless Bluetooth Headphones', qty: 1, price: 12500, image: IMG.headphones },
      { id: 'p2', name: 'RGB Mechanical Gaming Keyboard', qty: 1, price: 8950, image: IMG.keyboard },
      { id: 'p3', name: '20,000mAh Portable Power Bank - Fast Charger', qty: 1, price: 9005, image: IMG.powerbank },
    ],
  },
  {
    id: 'ORD-16485923',
    placedAt: '@11:30 am 9/12/2025',
    status: 'Confirmed',
    tags: ['Handfree'],
    shipping: 0,
    products: [
      { id: 'p4', name: 'Handsfree Earbuds with Charging Case', qty: 1, price: 1500, image: IMG.headphones },
    ],
  },
  {
    id: 'ORD-12649532',
    placedAt: '@13:20 pm 5/12/2025',
    status: 'Delivered',
    tags: ['Keyboard'],
    shipping: 0,
    products: [
      { id: 'p5', name: 'RGB Mechanical Gaming Keyboard', qty: 1, price: 6350, image: IMG.keyboard },
    ],
  },
  {
    id: 'ORD-28597460',
    placedAt: '@09:58 am 01/08/2025',
    status: 'Delivered',
    tags: ['Power Bank'],
    shipping: 0,
    products: [
      { id: 'p6', name: '20,000mAh Portable Power Bank - Fast Charger', qty: 2, price: 5900, image: IMG.powerbank },
    ],
  },
  {
    id: 'ORD-34976128',
    placedAt: '@21:14 pm 15/07/2025',
    status: 'Delivered',
    tags: ['Smart Watch', 'Mouse'],
    shipping: 0,
    products: [
      { id: 'p7', name: 'Smart Watch Series 6 AMOLED', qty: 1, price: 3950, image: IMG.smartwatch },
      { id: 'p8', name: 'Wireless Ergonomic Gaming Mouse', qty: 1, price: 1500, image: IMG.mouse },
    ],
  },
];

function formatLKR(value) {
  return `Rs. ${value.toLocaleString('en-US')}`;
}

function orderTotal(order) {
  return order.products.reduce((sum, p) => sum + p.price * p.qty, 0);
}

// ---------------------------------------------------------------------------
// Order tracking stepper
// ---------------------------------------------------------------------------
function detailFor(status, order) {
  if (status === 'Placed') return order.placedAt;
  return STATUS_COPY[status].hint;
}

function OrderTracking({ order }) {
  const currentIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <ol className="relative space-y-6">
      {STATUS_FLOW.map((status, index) => {
        const done = index <= currentIndex;
        const isLast = index === STATUS_FLOW.length - 1;

        return (
          <li key={status} className="relative flex gap-4">
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[11px] top-6 h-[calc(100%+0.5rem)] w-0.5 ${
                  index < currentIndex ? 'bg-emerald-500' : 'bg-neutral-200'
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-neutral-300 bg-white'
              }`}
            >
              {done ? (
                <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
              )}
            </span>
            <div className="pt-0.5">
              <p className={`text-sm font-medium ${done ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {STATUS_COPY[status].title}
              </p>
              <p className="text-[11px] text-neutral-500">{detailFor(status, order)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Order details modal
// ---------------------------------------------------------------------------
function OrderDetailsModal({ order, onClose }) {
  useEffect(() => {
    if (!order) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [order, onClose]);

  const subTotal = order ? orderTotal(order) : 0;

  
  return (
    <AnimatePresence>
      {order && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-900/50 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5">
              <div>
                <h2 id="order-details-title" className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                  <ClipboardListIcon className="h-4 w-4 text-neutral-700" />
                  Order Details
                </h2>
                <p className="mt-1 text-xs text-neutral-500">{order.id}</p>
                <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_BADGE[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-red-600 transition-colors hover:bg-red-50"
                aria-label="Close order details"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              <section aria-labelledby="tracking-title">
                <h3 id="tracking-title" className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <TruckIcon className="h-4 w-4 text-neutral-700" />
                  Order Tracking
                </h3>
                <div className="rounded-xl border border-neutral-200 p-4">
                  <OrderTracking order={order} />
                </div>
              </section>

              <section aria-labelledby="products-title" className="mt-6">
                <h3 id="products-title" className="mb-3 text-sm font-semibold text-neutral-900">
                  Products
                </h3>
                <ul className="divide-y divide-neutral-100">
                  {order.products.map((product) => (
                    <li key={product.id} className="flex items-center gap-3 py-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-11 w-11 rounded-full border border-neutral-200 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-neutral-900">{product.name}</p>
                        <p className="text-[11px] text-neutral-500">Qty: {product.qty}</p>
                      </div>
                      <p className="text-xs font-semibold text-neutral-900">{formatLKR(product.price * product.qty)}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <dl className="mt-5 space-y-2 border-t border-neutral-200 pt-4 text-xs">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Sub Total</dt>
                  <dd className="font-medium text-neutral-900">{formatLKR(subTotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Shipping</dt>
                  <dd className="font-medium text-emerald-600">{order.shipping === 0 ? 'Free' : formatLKR(order.shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2.5 text-sm">
                  <dt className="font-semibold text-neutral-900">Total</dt>
                  <dd className="font-semibold text-red-600">{formatLKR(subTotal + order.shipping)}</dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Order card (row in the list)
// ---------------------------------------------------------------------------
function OrderCard({ order, selected, onSelect, onViewDetails, onDelete }) {
  return (
    <li>
      <article
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        tabIndex={0}
        aria-current={selected ? 'true' : undefined}
        className={`flex cursor-pointer flex-col gap-4 rounded-xl border bg-white p-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:flex-row sm:items-center sm:gap-5 ${
          selected ? 'border-2 border-sky-500 shadow-md' : 'border-red-200 hover:border-red-400 hover:shadow-sm'
        }`}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-xs font-semibold tracking-wide text-white">
          <PackageIcon className="h-6 w-6" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-sm font-semibold text-neutral-900">{order.id}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_BADGE[order.status]}`}>
              {order.status}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-neutral-500">{order.placedAt}</p>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {order.tags.map((tag) => (
              <li key={tag} className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-600">
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50"
            aria-label={`Remove order ${order.id}`}
          >
            <Trash2Icon className="h-4 w-4" />
          </button>
          <div className="text-right">
            <p className="text-sm font-semibold text-neutral-900">{formatLKR(orderTotal(order))}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-red-600 transition-colors hover:text-red-700"
            >
              View Details
              <ArrowRightIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
      </article>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Orders page
// ---------------------------------------------------------------------------
const FILTERS = ['All', ...STATUS_FLOW];

export function OrderPage() {
  const [orders, setOrders] = useState(ORDERS);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(ORDERS[1].id);
  const [detailsId, setDetailsId] = useState(null);

  const visibleOrders = useMemo(() => {
    const q = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        filter === 'All' || order.status === filter;

      const matchesQuery =
        q.length === 0 ||
        order.id.toLowerCase().includes(q) ||
        order.tags.some((tag) =>
          tag.toLowerCase().includes(q)
        ) ||
        order.products.some((p) =>
          p.name.toLowerCase().includes(q)
        );

      return matchesFilter && matchesQuery;
    });

  }, [orders, filter, query]);


  const detailsOrder =
    orders.find((o) => o.id === detailsId) ?? null;


  return (
    <Layout>
                
    <main className="w-full bg-white">

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">

          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-red-600">
              <ShoppingBagIcon className="h-6 w-6 text-neutral-900" />
              My Orders
            </h1>

            <p className="mt-1 text-xs text-neutral-500">
              Track and manage your purchase
            </p>
          </div>


          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
            {orders.length} Items
          </span>

        </div>


        {/* Search + Filter */}
        <div className="mt-6 flex flex-col gap-3">

          <div className="relative">

            <input
              type="search"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              placeholder="Search by order ID or Product..."
              className="w-full rounded-full border border-neutral-300 px-4 py-2 pr-10 text-sm outline-none focus:border-red-500"
            />

            <SearchIcon
              className="absolute right-4 top-2.5 h-4 w-4 text-neutral-400"
            />

          </div>


          <div className="flex gap-2 overflow-x-auto">

            {FILTERS.map((item)=>(
              <button
                key={item}
                onClick={()=>setFilter(item)}
                className={`rounded-full px-5 py-2 text-xs ${
                  filter===item
                  ? "bg-red-600 text-white"
                  : "border border-neutral-300 text-neutral-700"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

        </div>



        {/* Orders List */}

        {
          visibleOrders.length > 0 ? (

            <ul className="mt-6 space-y-4">

              {
                visibleOrders.map((order)=>(

                  <OrderCard
                    key={order.id}
                    order={order}
                    selected={selectedId===order.id}

                    onSelect={() =>
                      setSelectedId(order.id)
                    }

                    onViewDetails={()=>{

                      setSelectedId(order.id);
                      setDetailsId(order.id);

                    }}

                    onDelete={()=>{

                      setOrders((prev)=>
                        prev.filter(
                          (o)=>o.id!==order.id
                        )
                      );

                    }}

                  />

                ))
              }

            </ul>


          ) : (

            <div className="mt-10 text-center">

              <PackageSearchIcon className="mx-auto h-10 w-10 text-neutral-300"/>

              <p className="mt-3 text-sm font-medium">
                No orders found
              </p>

            </div>

          )
        }


      </div>



      {/* Details Popup */}

      <OrderDetailsModal
        order={detailsOrder}
        onClose={() =>
          setDetailsId(null)
        }
      />


    </main>
    </Layout>
  );
}


export default OrderPage;