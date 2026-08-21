import { useState } from "react";
import { ChevronRight, CreditCard, Landmark, MapPin, Package, ShoppingBag } from "lucide-react";
import Layout from "../../components/layout/Layout";

const orderItems = [
	{
		name: "Premium Wireless Bluetooth Headphones",
		qty: 1,
		time: "1 day ago",
		price: 12400,
		image:
			"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80",
	},
	{
		name: "RGB Mechanical Gaming Keyboard",
		qty: 1,
		time: "1 day ago",
		price: 6650,
		image:
			"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80",
	},
	{
		name: "20,000mAh Portable Power Bank - Fast Charger",
		qty: 1,
		time: "2 days ago",
		price: 12400,
		image:
			"https://images.unsplash.com/photo-1609592806596-4d1f8b48b5c7?auto=format&fit=crop&w=200&q=80",
	},
];

const paymentMethods = [
	{ id: "card", label: "Credit Card", icon: CreditCard },
	{ id: "debit", label: "Debit Card", icon: Landmark },
	{ id: "koko", label: "Koko Payment", icon: Package },
];

const inputClassName =
	"h-11 w-full rounded-md border border-[#cfcfcf] bg-white px-3 text-sm text-[#222] outline-none transition focus:border-[#ff2020] focus:ring-2 focus:ring-[#ff2020]/15";

function Payment() {
	const [selectedMethod, setSelectedMethod] = useState("card");
	const subTotal = 33850;
	const shipping = 0;
	const discount = 3385;
	const total = subTotal + shipping - discount;

	return (
		<Layout>
			<main className="min-h-screen bg-[#f7f7f7] text-[#1b1b1b]">
				<section className="border-t-4 border-[#ff2020] bg-white">
					<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<div className="flex items-center gap-2 text-[#ff2020]">
									<ShoppingBag className="h-6 w-6" />
									<h1 className="text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
										Place Order
									</h1>
								</div>
								<p className="mt-1 text-sm text-black/35 sm:text-[0.95rem]">
									Complete your payment securely
								</p>
							</div>

							<div className="flex items-center gap-1 text-sm text-black/45">
								<span>Cart</span>
								<ChevronRight className="h-4 w-4" />
								<span className="font-medium text-black/85">Place Order</span>
							</div>
						</div>

						<div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)] lg:items-start">
							<div className="space-y-4">
								<section className="rounded-2xl border border-[#d7d7d7] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)]">
									<div className="flex items-center gap-2 text-[#202020]">
										<MapPin className="h-5 w-5 text-[#1f1f1f]" />
										<h2 className="text-lg font-semibold">Delivery Address</h2>
									</div>

									<form className="mt-5 grid gap-4">
										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													First Name
												</label>
												<input className={inputClassName} />
											</div>
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													Last Name
												</label>
												<input className={inputClassName} />
											</div>
										</div>

										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													Street Address
												</label>
												<input className={inputClassName} />
											</div>
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													City
												</label>
												<input className={inputClassName} />
											</div>
										</div>

										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													Postal Code
												</label>
												<input className={inputClassName} />
											</div>
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													Country
												</label>
												<input className={inputClassName} />
											</div>
										</div>
									</form>
								</section>

								<section className="rounded-2xl border border-[#d7d7d7] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)]">
									<div className="flex items-center gap-2 text-[#202020]">
										<CreditCard className="h-5 w-5 text-[#1f1f1f]" />
										<h2 className="text-lg font-semibold">Payment Details</h2>
									</div>

									<div className="mt-5 flex flex-wrap gap-3">
										{paymentMethods.map(({ id, label, icon: Icon }) => (
											<button
												key={id}
												type="button"
												onClick={() => setSelectedMethod(id)}
												aria-pressed={selectedMethod === id}
												className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
													selectedMethod === id
														? "border-[#ff2020] bg-[#ff2020] text-white shadow-sm"
														: "border-[#ff2020]/35 bg-white text-[#ff2020] hover:bg-[#ff2020]/5"
												}`}
											>
												<Icon className="h-4 w-4" />
												{label}
											</button>
										))}
									</div>

									<p className="mt-3 text-xs text-black/45">
										Selected method: {paymentMethods.find((method) => method.id === selectedMethod)?.label}
									</p>

									<form className="mt-6 grid gap-4">
										<div>
											<label className="mb-1 block text-xs font-medium text-black/55">
												Card Number
											</label>
											<input className={inputClassName}  />
										</div>

										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													Expiry mm/yy
												</label>
												<input className={inputClassName} />
											</div>
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													CCV
												</label>
												<input className={inputClassName} />
											</div>
										</div>

										<div>
											<label className="mb-1 block text-xs font-medium text-black/55">
												Card Holder Name
											</label>
											<input className={inputClassName} />
										</div>

										<div className="grid gap-3 sm:grid-cols-[1fr_120px]">
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													Discount Coupon
												</label>
												<input className={inputClassName} placeholder="Enter Code" />
											</div>
											<div className="flex items-end">
												<button
													type="button"
													className="h-11 w-full rounded-md bg-[#ff2020] text-sm font-semibold text-white transition hover:bg-[#e21818]"
												>
													Apply
												</button>
											</div>
										</div>

										<button
											type="button"
											className="mt-1 h-11 rounded-md bg-black text-sm font-semibold text-white transition hover:bg-black/90"
										>
											Pay Now
										</button>
									</form>
								</section>
							</div>

							<aside className="rounded-2xl border border-[#d7d7d7] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] lg:sticky lg:top-6">
								<div className="flex items-center gap-2 text-[#202020]">
									<Package className="h-5 w-5 text-[#1f1f1f]" />
									<h2 className="text-lg font-semibold">Order Summary</h2>
								</div>

								<div className="mt-5 space-y-4">
									{orderItems.map((item) => (
										<div key={item.name} className="flex items-start gap-3">
											<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#ff2020] bg-[#f4f4f4]">
												<img
													src={item.image}
													alt={item.name}
													className="h-full w-full object-cover"
												/>
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium leading-5 text-black/90">
													{item.name}
												</p>
												<div className="mt-1 flex items-center justify-between text-xs text-black/45">
													<span>Qty: {item.qty}</span>
													<span>{item.time}</span>
												</div>
											</div>
										</div>
									))}
								</div>

								<div className="mt-5 space-y-2 border-t border-black/10 pt-4 text-sm">
									<div className="flex items-center justify-between text-black/60">
										<span>Sub Total</span>
										<span>Rs. {subTotal.toLocaleString()}</span>
									</div>
									<div className="flex items-center justify-between text-black/60">
										<span>Shipping</span>
										<span>Free</span>
									</div>
									<div className="flex items-center justify-between text-[#ff2020]">
										<span>Discount</span>
										<span>-Rs. {discount.toLocaleString()}</span>
									</div>
								</div>

								<div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
									<span className="text-base font-semibold text-black">Total</span>
									<span className="text-lg font-bold text-black">
										Rs. {total.toLocaleString()}
									</span>
								</div>
							</aside>
						</div>
					</div>
				</section>
			</main>
		</Layout>
	);
}

export default Payment;
