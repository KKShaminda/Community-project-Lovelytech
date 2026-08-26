import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signIn } from "../../services/authServices";
import Alert from "../../components/common/Alert";

const getDashboardPath = (role) => {
  const normalizedRole = (role || "").toLowerCase();

  if (normalizedRole === "admin") {
    return "/admin/dashboard";
  }

  if (normalizedRole === "receptionist") {
    return "/receptionist/dashboard";
  }

  return "/products";
};


export function SigninPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(() => location.state?.email || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(() => location.state?.message || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await signIn(email, password, rememberMe);
      const role = data?.user?.role || data?.role || "User";
      setMessage("Login successful");
      const target = location.state?.from || getDashboardPath(role);
      navigate(target);
    } catch (error) {
      setMessage(error.message || "Unable to sign in right now");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left panel — image + brand card */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-screen overflow-hidden">
        <img src="/signin-image.jpg" alt="Sign in hero" className="w-full h-full object-cover"
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0  bg-opacity-30 flex flex-col items-center justify-center p-8">
          
          {/* Glass Morphism Card */}
          <div className="backdrop-blur-sm rounded-4xl p-12 max-w-136 min-h-144 border border-white border-opacity-20 shadow-2xl flex flex-col justify-center">
            
            {/* Logo Section */}
            <div className="rounded-3xl p-1 mb-10 mx-auto w-fit">
              <img src="/Logo.png" alt="Sign in hero" className="rounded-3xl w-65 h-30 object-contain"/>
            </div>

            <h2 className="text-center text-5xl  font-bold mb-5 leading-tight text-white">
              Shop Smart Repair Easy
            </h2>
            <p className="text-center text-[16px] font-sans text-black leading-relaxed">
              A complete solution for buying, repairing, and managing your devices with ease.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — sign-in form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E4342F]">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-500">
            Please enter your details to sign in
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-[16px] font-semibold text-gray-900 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[#E4342F] px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#E4342F]/30"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[16px] font-semibold text-gray-900 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-[#E4342F] px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#E4342F]/30"
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-sm text-[#E4342F] hover:underline"
                >
                  Forget Password ?
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#E4342F] text-[#E4342F] focus:ring-[#E4342F]/40"
              />
              Remember Me
            </label>

            {message ? (
              <Alert
                type={message.toLowerCase().includes("success") ? "success" : "error"}
                message={message}
                onClose={() => setMessage("")}
              />
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#E4342F] py-3.5 text-[16px] font-bold text-white shadow-sm transition hover:bg-[#c92923] focus:outline-none focus:ring-2 focus:ring-[#E4342F]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-[#E4342F] hover:underline">
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SigninPage;