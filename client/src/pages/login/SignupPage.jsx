import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { signUp } from "../../services/authServices";
import Alert from "../../components/common/Alert";

export function SignupPage() {
	const navigate = useNavigate();
	const [fullname, setFullname] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [agree, setAgree] = useState(false);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage("");

		if (!agree) {
			setMessage("You must agree to the terms to continue.");
			return;
		}

		if (password !== confirmPassword) {
			setMessage("Passwords do not match.");
			return;
		}

		// sanitize phone (keep digits only) and validate 10 digits
		const cleanedPhone = String(phone || "").replace(/\D/g, "");
		if (!/^\d{10}$/.test(cleanedPhone)) {
			setMessage("Phone number must be 10 digits (no country code).");
			return;
		}

		setLoading(true);

		try {
			const data = await signUp({
				fullname: fullname.trim(),
				email: email.trim().toLowerCase(),
				phone: cleanedPhone,
				password,
				role: "User",
			});
			setMessage(data?.message || "Account created successfully");
			navigate("/login", {
				state: {
					message: "Account created successfully! Please sign in.",
					email: email.trim().toLowerCase(),
				},
			});
		} catch (err) {
			setMessage(err.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col lg:flex-row-reverse h-screen bg-white overflow-hidden">
			{/* Right panel on desktop (Hero Image + Glass Card) */}
			<div className="relative w-full lg:w-1/2 h-64 lg:h-screen overflow-hidden">
				<img
					src="/signup-image.jpg"
					alt="Sign up hero"
					fetchPriority="high"
					loading="eager"
					decoding="sync"
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center p-8">
					<div className="animate-pop-card backdrop-blur-md bg-white/10 rounded-4xl p-12 max-w-136 min-h-144 border border-white/20 shadow-2xl flex flex-col justify-center">
						<div className="animate-fade-in-down rounded-3xl p-1 mb-10 mx-auto w-fit">
							<img src="/Logo.png" alt="Lovely Tech" className="rounded-3xl w-65 h-30 object-contain drop-shadow-md" />
						</div>
						<h2 className="animate-fade-in-up text-center text-5xl font-bold mb-5 leading-tight text-white drop-shadow-sm">
							Welcome to Lovely Tech
						</h2>
						<p className="animate-fade-in-up text-center text-[16px] font-sans text-white/90 leading-relaxed drop-shadow">
							A complete solution for buying, repairing, and managing your devices with ease.
						</p>
					</div>
				</div>
			</div>

			{/* Left panel on desktop (Form) */}
			<div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 lg:px-20 py-12 overflow-y-auto">
				<div className="animate-fade-in-left w-full max-w-md">
					<h1 className="animate-fade-in-down text-3xl sm:text-4xl font-bold text-[#E4342F]">
						Welcome to Lovely <span className="text-black">Tech</span>
					</h1>
					<p className="mt-2 text-gray-500">
						Start your journey with us today
					</p>

					<form onSubmit={handleSubmit} className="mt-8 space-y-4">
						<div className="animate-fade-in-up">
							<label className="block text-sm font-medium text-gray-700">Full Name</label>
							<input
								value={fullname}
								onChange={(e) => setFullname(e.target.value)}
								required
								className="mt-1 block w-full rounded-md border border-[#E4342F] px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#E4342F]/30 transition"
								placeholder="Ex: John Doe"
							/>
						</div>

						<div className="animate-fade-in-up">
							<label className="block text-sm font-medium text-gray-700">Email</label>
							<input
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								type="email"
								required
								className="mt-1 block w-full rounded-md border border-[#E4342F] px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#E4342F]/30 transition"
								placeholder="Ex: john@gmail.com"
							/>
						</div>

						<div className="animate-fade-in-up">
							<label className="block text-sm font-medium text-gray-700">Phone</label>
							<input
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								required
								className="mt-1 block w-full rounded-md border border-[#E4342F] px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#E4342F]/30 transition"
								placeholder="Ex: +94 123456789"
							/>
						</div>

						<div className="animate-fade-in-up">
							<label className="block text-sm font-medium text-gray-700">Password</label>
							<input
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								type="password"
								required
								className="mt-1 block w-full rounded-md border border-[#E4342F] px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#E4342F]/30 transition"
								placeholder="Enter your password"
							/>
						</div>

						<div className="animate-fade-in-up">
							<label className="block text-sm font-medium text-gray-700">Confirm Password</label>
							<input
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								type="password"
								required
								className="mt-1 block w-full rounded-md border border-[#E4342F] px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#E4342F]/30 transition"
								placeholder="Re-enter your password"
							/>
						</div>

						<div className="animate-fade-in-up flex items-center gap-2">
							<input
								id="agree"
								type="checkbox"
								checked={agree}
								onChange={(e) => setAgree(e.target.checked)}
								className="h-4 w-4 rounded border-[#E4342F] text-[#E4342F] focus:ring-[#E4342F]/40 cursor-pointer"
							/>
							<label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer select-none">
								I agree to the Terms of Services and Privacy Policies
							</label>
						</div>

						{message ? (
							<div className="animate-fade-in-down">
								<Alert
									type={message.toLowerCase().includes("success") ? "success" : "error"}
									message={message}
									onClose={() => setMessage("")}
								/>
							</div>
						) : null}

						<button
							disabled={loading}
							type="submit"
							className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#E4342F] py-3.5 text-[16px] font-bold text-white shadow-md shadow-[#E4342F]/20 transition-all hover:bg-[#c92923] hover:shadow-lg hover:shadow-[#E4342F]/30 hover:scale-[1.01] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-75"
						>
							{loading ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									<span>Creating account...</span>
								</>
							) : (
								<span>Sign up</span>
							)}
						</button>

						<p className="animate-fade-in-up text-center text-sm text-gray-500">
							Already have an account?{" "}
							<Link to="/login" className="font-medium text-[#E4342F] hover:underline">
								Sign in here
							</Link>
						</p>
					</form>
				</div>
			</div>
		</div>
	);
}

export default SignupPage;
