import { ChevronRight, CircleCheckBig, CreditCard, MapPin, Package, ShoppingCart, Truck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'

function Currency({ value, highlight = false, negative = false }) {
	return (
		<span className={highlight ? 'font-semibold text-[#ff2020]' : 'font-medium text-slate-800'}>
			{negative ? '-' : ''}Rs. {value.toLocaleString()}
		</span>
	)
}

function ProductThumb({ item }) {
	return (
		<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#ff2020] bg-[#fafafa] shadow-[0_2px_8px_rgba(255,32,32,0.12)]">
			{item.image ? (
				<img src={item.image} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
			) : (
				<Package className="h-7 w-7 text-slate-400" />
			)}
		</div>
	)
}

function Step({ label, active, done }) {
	return (
		<div className="flex flex-col items-center gap-2">
			<span
				className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
					done
						? 'border-[#3bb54a] bg-[#3bb54a] text-white'
						: active
							? 'border-[#3bb54a] bg-white text-[#3bb54a]'
							: 'border-[#bdbdbd] bg-white text-[#bdbdbd]'
				}`}
			>
				{done ? <CircleCheckBig className="h-3.5 w-3.5" /> : '•'}
			</span>
			<span className={`text-[10px] font-medium ${done || active ? 'text-[#3bb54a]' : 'text-[#a6a6a6]'}`}>
				{label}
			</span>
		</div>
	)
}

function PlaceOrder() {
	const location = useLocation()
	const navigate = useNavigate()

	const orderDetails = location.state?.orderDetails

	// Fallback mock items
	const fallbackItems = [
		{
			name: 'Premium Wireless Bluetooth Headphones',
			color: 'Black',
			size: 'Standard',
			qty: 1,
			price: 2400,
			image: '',
		},
		{
			name: 'RGB Mechanical Gaming Keyboard',
			color: 'Metallic',
			size: 'Standard',
			qty: 1,
			price: 6650,
			image: '',
		},
		{
			name: '20,000mAh Portable Power Bank - Fast Charger',
			color: 'Metallic',
			size: 'Standard',
			qty: 2,
			price: 24800,
			image: '',
		},
	]

	const items = orderDetails ? orderDetails.products : fallbackItems
	const subTotal = orderDetails
		? items.reduce((acc, item) => acc + (item.price || 0) * (item.qty || item.quantity || 1), 0)
		: 33850
	const shipping = orderDetails ? (orderDetails.shipping || 0) : 0
	const total = orderDetails ? (orderDetails.totalAmount || (subTotal + shipping)) : 30465
	const discount = Math.max(0, subTotal + shipping - total)

	const deliveryAddress = orderDetails?.deliveryAddress || {
		firstName: "Pasindu",
		lastName: "Perera",
		streetAddress: "124/B, Nallurawa",
		city: "Panadura",
		postalCode: "12500",
		country: "Sri Lanka",
	}

	const paymentMethod = orderDetails?.paymentMethod || "debit"
	const cardLastFour = orderDetails?.cardNumberLastFour || "889"

	return (
		<Layout>
			<main className="min-h-screen bg-[#f6f6f6] text-slate-900">
				<section className="border-t-4 border-[#ff2020] bg-white">
					<div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
						<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
							<div>
								<div className="flex items-center gap-2 text-[#ff2020]">
									<ShoppingCart className="h-6 w-6" />
									<h1 className="text-2xl font-semibold tracking-tight sm:text-[1.7rem]">Order Confirmation</h1>
								</div>
								<p className="mt-1 text-sm text-slate-400 sm:text-[0.95rem]">
									Thank you for your purchase...
								</p>
							</div>

							<div className="flex items-center gap-1 text-sm text-slate-400">
								<span>Cart</span>
								<ChevronRight className="h-4 w-4" />
								<span>Place Order</span>
								<ChevronRight className="h-4 w-4" />
								<span className="font-medium text-slate-700">Order Confirmation</span>
							</div>
						</div>

						<div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
							<section className="rounded-2xl border border-[#d8d8d8] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
								<div className="flex items-center gap-2 text-slate-800">
									<Package className="h-5 w-5 text-slate-700" />
									<h2 className="text-lg font-semibold">Order Summary</h2>
								</div>

								<div className="mt-5 space-y-5">
									{items.map((item) => (
										<div key={item.name} className="flex items-start gap-4">
											<ProductThumb item={item} />

											<div className="min-w-0 flex-1">
												<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
													<div>
														<h3 className="text-sm font-medium text-slate-800 sm:text-[0.95rem]">{item.name}</h3>
														<div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-400">
															{item.color && <span>Color: {item.color}</span>}
															{item.size && <span>Size: {item.size}</span>}
															<span>Qty: {item.qty || item.quantity || 1}</span>
														</div>
													</div>

													<div className="shrink-0 text-sm font-medium text-[#ff2020]">
														<Currency value={item.price * (item.qty || item.quantity || 1)} highlight />
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</section>

							<div className="space-y-5">
								<section className="rounded-2xl border border-[#d8d8d8] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
									<div className="flex items-center gap-2 text-slate-800">
										<CreditCard className="h-5 w-5 text-slate-700" />
										<h2 className="text-lg font-semibold">Price Breakdown</h2>
									</div>

									<div className="mt-5 space-y-3 text-sm">
										<div className="flex items-center justify-between text-slate-500">
											<span>Sub Total</span>
											<Currency value={subTotal} />
										</div>
										<div className="flex items-center justify-between text-slate-500">
											<span>Shipping</span>
											<span className="font-medium text-slate-800">Free</span>
										</div>
										<div className="flex items-center justify-between text-[#ff2020]">
											<span>Discount</span>
											<Currency value={discount} highlight negative />
										</div>

										<div className="mt-4 border-t border-slate-200 pt-4">
											<div className="flex items-center justify-between text-base">
												<span className="font-medium text-slate-900">Total</span>
												<span className="text-lg font-semibold text-slate-900">Rs. {total.toLocaleString()}</span>
											</div>
										</div>
									</div>
								</section>

								<section className="rounded-2xl border border-[#d8d8d8] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
									<div className="flex items-center gap-2 text-slate-800">
										<Truck className="h-5 w-5 text-slate-700" />
										<h2 className="text-lg font-semibold">Delivery Information</h2>
									</div>

									<div className="mt-5 grid gap-5 sm:grid-cols-2">
										<div>
											<p className="text-xs font-medium uppercase tracking-wide text-slate-400">Address</p>
											<p className="mt-2 text-xs leading-5 text-slate-500">
												{deliveryAddress.firstName} {deliveryAddress.lastName}
												<br />
												{deliveryAddress.streetAddress},
												<br />
												{deliveryAddress.city},
												<br />
												{deliveryAddress.country}, {deliveryAddress.postalCode}
											</p>
										</div>

										<div>
											<p className="text-xs font-medium uppercase tracking-wide text-slate-400">Estimated Delivery</p>
											<p className="mt-2 text-xs leading-5 text-slate-500">
												Within 3-5 working days
											</p>
										</div>
									</div>

									<div className="mt-5">
										<p className="text-xs font-medium uppercase tracking-wide text-slate-400">Order Status</p>
										<div className="mt-4 flex items-start justify-between gap-2 border-t border-slate-200 pt-4">
											<Step label="Placed" done />
											<Step label="Confirmed" done />
											<Step label="Processed" active />
											<Step label="Delivered" />
										</div>
									</div>
								</section>

								<section className="rounded-2xl border border-[#d8d8d8] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
									<div className="flex items-center gap-2 text-slate-800">
										<MapPin className="h-5 w-5 text-slate-700" />
										<h2 className="text-lg font-semibold">Payment Summary</h2>
									</div>

									<div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
										<div className="space-y-2 text-xs text-slate-500">
											{paymentMethod === "koko" ? (
												<p>Debited Rs. {total.toLocaleString()} via Koko Payment</p>
											) : (
												<p>Your card ending in {cardLastFour} has been debited by Rs. {total.toLocaleString()}</p>
											)}
											<p className="capitalize">{paymentMethod} Card</p>
										</div>

										<div className="inline-flex items-center gap-2 rounded-full bg-[#3bb54a] px-4 py-2 text-sm font-semibold text-white shadow-sm">
											<CircleCheckBig className="h-4 w-4" />
											Successful
										</div>
									</div>
								</section>
							</div>
						</div>

						<div className="mt-6 grid gap-4 sm:grid-cols-2">
							<button
								type="button"
								onClick={() => navigate('/orders')}
								className="h-12 rounded-xl bg-black text-sm font-semibold text-white transition hover:bg-black/90"
							>
								← Back to My Orders
							</button>
							<button
								type="button"
								onClick={() => navigate('/products')}
								className="h-12 rounded-xl bg-black text-sm font-semibold text-white transition hover:bg-black/90"
							>
								Continue Shopping
							</button>
						</div>
					</div>
				</section>
			</main>
		</Layout>
	)
}

export default PlaceOrder
