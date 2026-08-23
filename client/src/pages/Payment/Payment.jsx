import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CreditCard, Landmark, MapPin, Package, ShoppingBag, Building, Info, Upload } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { getCartItems, clearCart } from "../../utils/cartStorage";
import { createOrder } from "../../services/orderServices";
import { resolveImageUrl, getCategoryFallbackImage } from "../../data/productsData";

const inputClassName =
	"h-11 w-full rounded-md border border-[#cfcfcf] bg-white px-3 text-sm text-[#222] outline-none transition focus:border-[#ff2020] focus:ring-2 focus:ring-[#ff2020]/15";

function Payment() {
	const navigate = useNavigate();
	const [items, setItems] = useState(() => getCartItems());
	const [couponCode, setCouponCode] = useState("");
	const [couponDiscountPercent, setCouponDiscountPercent] = useState(10); // default 10%
	const [discountApplied, setDiscountApplied] = useState(true);

	// Address Form State
	const [address, setAddress] = useState({
		firstName: "",
		lastName: "",
		streetAddress: "",
		city: "",
		postalCode: "",
		country: "",
	});

	const [slipFile, setSlipFile] = useState(null);
	const [showBankModal, setShowBankModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const subTotal = useMemo(() => {
		return items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
	}, [items]);

	const discount = useMemo(() => {
		if (!discountApplied || subTotal === 0) return 0;
		return Math.round((subTotal * couponDiscountPercent) / 100);
	}, [subTotal, discountApplied, couponDiscountPercent]);

	const shipping = 0;
	const total = Math.max(0, subTotal + shipping - discount);

	// Redirect if cart is empty
	useEffect(() => {
		if (items.length === 0) {
			navigate("/cart");
		}
	}, [items, navigate]);

	const handleAddressChange = (e, field) => {
		setAddress((prev) => ({ ...prev, [field]: e.target.value }));
	};

	const handleApplyCoupon = (e) => {
		e.preventDefault();
		const trimmed = couponCode.trim().toUpperCase();
		if (!trimmed) return;

		if (trimmed === "LOVELY10" || trimmed === "SAVE10" || trimmed === "DEMO10") {
			setCouponDiscountPercent(10);
			setDiscountApplied(true);
			alert("Coupon applied! 10% discount added.");
		} else if (trimmed === "LOVELY20" || trimmed === "SAVE20") {
			setCouponDiscountPercent(20);
			setDiscountApplied(true);
			alert("Coupon applied! 20% discount added.");
		} else {
			alert('Invalid coupon code. Try "LOVELY10".');
		}
	};

	const handleSubmitOrder = async (e) => {
		e.preventDefault();
		setErrorMsg("");

		// Simple Validations
		if (
			!address.firstName.trim() ||
			!address.lastName.trim() ||
			!address.streetAddress.trim() ||
			!address.city.trim() ||
			!address.postalCode.trim() ||
			!address.country.trim()
		) {
			setErrorMsg("Please fill in all delivery address fields.");
			return;
		}

		if (!slipFile) {
			setErrorMsg("Please upload your bank payment slip to proceed.");
			return;
		}

		setLoading(true);

		try {
			// Extract tags from items
			const tags = items.map((item) => {
				const parts = item.name.split(" ");
				return parts.length > 1 ? parts[parts.length - 1] : item.name;
			});

			const productsPayload = items.map((item) => ({
				id: item.id || item._id,
				name: item.name,
				qty: item.quantity,
				price: item.price,
				image: item.image,
			}));

			const formData = new FormData();
			formData.append("products", JSON.stringify(productsPayload));
			formData.append("tags", JSON.stringify(tags));
			formData.append("shipping", shipping);
			formData.append("deliveryAddress", JSON.stringify(address));
			formData.append("paymentMethod", "Bank Transfer");
			formData.append("slip", slipFile);

			const response = await createOrder(formData);
			const createdOrder = response.data || response;

			// Clear shopping cart
			clearCart();

			// Navigate to PlaceOrder confirmation screen with orderDetails state
			navigate("/place-order", {
				state: {
					orderDetails: {
						...createdOrder,
						// Ensure fields display correctly
						products: createdOrder.products || productsPayload,
						deliveryAddress: createdOrder.deliveryAddress || address,
						paymentMethod: "Bank Transfer",
						shipping: createdOrder.shipping || shipping,
						totalAmount: createdOrder.totalAmount || total,
					},
				},
			});
		} catch (err) {
			console.error("Order payment error:", err);
			setErrorMsg(err.message || "Failed to process payment and place order.");
		} finally {
			setLoading(false);
		}
	};

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

									<form className="mt-5 grid gap-4" onSubmit={(e) => e.preventDefault()}>
										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													First Name
												</label>
												<input
													className={inputClassName}
													value={address.firstName}
													onChange={(e) => handleAddressChange(e, "firstName")}
													required
												/>
											</div>
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													Last Name
												</label>
												<input
													className={inputClassName}
													value={address.lastName}
													onChange={(e) => handleAddressChange(e, "lastName")}
													required
												/>
											</div>
										</div>

										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													Street Address
												</label>
												<input
													className={inputClassName}
													value={address.streetAddress}
													onChange={(e) => handleAddressChange(e, "streetAddress")}
													required
												/>
											</div>
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													City
												</label>
												<input
													className={inputClassName}
													value={address.city}
													onChange={(e) => handleAddressChange(e, "city")}
													required
												/>
											</div>
										</div>

										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													Postal Code
												</label>
												<input
													className={inputClassName}
													value={address.postalCode}
													onChange={(e) => handleAddressChange(e, "postalCode")}
													required
												/>
											</div>
											<div>
												<label className="mb-1 block text-xs font-medium text-black/55">
													Country
												</label>
												<input
													className={inputClassName}
													value={address.country}
													onChange={(e) => handleAddressChange(e, "country")}
													required
												/>
											</div>
										</div>
									</form>
								</section>

								<section className="rounded-2xl border border-[#d7d7d7] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)]">
									<div className="flex items-center gap-2 text-[#202020]">
										<Building className="h-5 w-5 text-[#1f1f1f]" />
										<h2 className="text-lg font-semibold">Payment Details (Bank Transfer)</h2>
									</div>

									<div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
										<Info className="h-5 w-5 text-[#ff2020] shrink-0 mt-0.5" />
										<div className="text-xs text-slate-600 leading-relaxed">
											<p className="font-semibold text-slate-800">Bank Transfer Steps:</p>
											<p className="mt-1">1. Transfer the total amount (<strong>Rs. {total.toLocaleString()}</strong>) to our corporate bank account.</p>
											<p>2. Take a photo or screenshot of the transaction receipt/slip.</p>
											<p>3. Upload the slip image here and submit your order. Our admins will verify and approve your order tracking timeline.</p>
										</div>
									</div>

									<div className="mt-4 flex justify-start">
										<button
											type="button"
											onClick={() => setShowBankModal(true)}
											className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-black text-white hover:bg-black/90 transition shadow-sm active:scale-95 cursor-pointer"
										>
											<Building className="h-3.5 w-3.5" />
											View Bank Details
										</button>
									</div>

									<form className="mt-6 grid gap-4" onSubmit={handleSubmitOrder}>
										<div className="border-t border-slate-100 pt-4">
											<label className="block text-xs font-medium text-black/55 mb-2">
												Upload Payment Slip
											</label>
											
											<div className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#cfcfcf] hover:border-[#ff2020] rounded-xl p-6 bg-slate-50/50 transition cursor-pointer">
												<input
													type="file"
													accept="image/*"
													onChange={(e) => setSlipFile(e.target.files[0] || null)}
													className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
													required
												/>
												<Upload className="h-8 w-8 text-slate-400 mb-2" />
												<p className="text-xs font-semibold text-slate-700">
													{slipFile ? slipFile.name : "Select or drag slip image here"}
												</p>
												<p className="text-[10px] text-slate-400 mt-1">
													PNG, JPG, JPEG up to 5MB
												</p>
											</div>
										</div>

										{errorMsg && (
											<p className="text-red-500 text-xs font-semibold mt-1">
												{errorMsg}
											</p>
										)}

										<button
											type="submit"
											disabled={loading}
											className="mt-1 h-11 rounded-md bg-[#ff2020] hover:bg-[#e21818] text-sm font-semibold text-white transition disabled:bg-gray-400 cursor-pointer shadow-md"
										>
											{loading ? "Submitting Slip & Placing Order..." : "Submit Order"}
										</button>
									</form>
								</section>
							</div>

							{/* Bank Details Modal Popbox */}
							{showBankModal && (
								<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
									<div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
										<div className="flex items-center gap-2 text-[#ff2020] mb-4">
											<Building className="h-5 w-5" />
											<h3 className="text-base font-bold">Bank Account Details</h3>
										</div>

										<div className="space-y-3 text-xs border-y border-slate-100 py-4 text-slate-700">
											<div className="flex justify-between">
												<span className="text-slate-400">Bank Name</span>
												<span className="font-semibold text-slate-800">LovelyTech Development Bank</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">Account Number</span>
												<span className="font-semibold text-slate-800 font-mono">1002-3948-2948-002</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">Account Name</span>
												<span className="font-semibold text-slate-800">LovelyTech (PVT) LTD</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">Branch</span>
												<span className="font-semibold text-slate-800">Colombo Main Branch</span>
											</div>
											<div className="flex justify-between border-t border-dashed border-slate-200 pt-3 text-sm font-bold text-[#ff2020]">
												<span>Total to pay</span>
												<span>Rs. {total.toLocaleString()}</span>
											</div>
										</div>

										<div className="mt-5 flex justify-end">
											<button
												type="button"
												onClick={() => setShowBankModal(false)}
												className="px-4 py-2 text-xs font-semibold rounded-lg bg-black text-white hover:bg-black/90 transition cursor-pointer"
											>
												Close
											</button>
										</div>
									</div>
								</div>
							)}

							<aside className="rounded-2xl border border-[#d7d7d7] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] lg:sticky lg:top-6">
								<div className="flex items-center gap-2 text-[#202020]">
									<Package className="h-5 w-5 text-[#1f1f1f]" />
									<h2 className="text-lg font-semibold">Order Summary</h2>
								</div>

								<div className="mt-5 space-y-4 max-h-[40vh] overflow-y-auto pr-1">
									{items.map((item) => (
										<div key={item.id || item._id} className="flex items-start gap-3">
											<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#ff2020] bg-[#f4f4f4]">
												<img
													src={resolveImageUrl(item.image, "Speakers & Audios")}
													alt={item.name}
													className="h-full w-full object-cover"
													onError={(e) => {
														e.target.src = getCategoryFallbackImage("Speakers & Audios");
													}}
												/>
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium leading-5 text-black/90 truncate">
													{item.name}
												</p>
												<div className="mt-1 flex items-center justify-between text-xs text-black/45">
													<span>Qty: {item.quantity || 1}</span>
													<span>Rs. {(item.price || 0).toLocaleString()}</span>
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
									{discount > 0 && (
										<div className="flex items-center justify-between text-[#ff2020]">
											<span>Discount ({couponDiscountPercent}%)</span>
											<span>-Rs. {discount.toLocaleString()}</span>
										</div>
									)}
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
