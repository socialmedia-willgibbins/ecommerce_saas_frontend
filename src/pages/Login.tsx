import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { domainUrl } from "../utils/constants";
import axios from "axios";
import Logo from "../assets/logo.png";
import OtpInput from "react-otp-input";

interface UserData {
  email: string;
  password: string;
}

export default function Login() {
  const [userData, setUserData] = useState<UserData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    if (token && role === 'admin') {
      navigate('/admin-home', { replace: true });
    }
  }, [navigate]);

  // Countdown Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (showOtp && resendDisabled && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtp, resendDisabled, resendTimer]);

  const handleInputChange = (field: keyof UserData, value: string) => {
    if (userData.email && userData.password) setError("");
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData.email || !userData.password) {
      setError("Please fill the required fields");
      toast.error("Please fill the required fields");
      return;
    }
    try {
      setLoading(true);
      const resp = await axios.post(`${domainUrl}users/login/`, {
        email: userData.email.toLowerCase(),
        password: userData.password,
      });

      toast.success(resp.data.message);
      setShowOtp(true);
      setResendTimer(60);
      setResendDisabled(true);
      setOtp("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter OTP before submitting");
      return;
    }
    try {
      setLoading(true);
      const resp = await axios.post(`${domainUrl}users/verify-otp/`, {
        identifier: userData.email.toLowerCase(),
        otp,
      });

      localStorage.setItem("access_token", resp.data.access);
      localStorage.setItem("refresh_token", resp.data.refresh);
      localStorage.setItem("role", resp.data.user.role);
      localStorage.setItem("user_name", resp.data.user.username);
      localStorage.setItem("email", resp.data.user.email);
      localStorage.setItem("phoneNumber", resp.data.user.phone_number);
      localStorage.setItem(
        "default_address",
        resp.data.user.default_shipping_address || ""
      );

      if (resp.data.access && resp.data.user.role === "admin") {
        navigate("/admin-home");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    try {
      setResendLoading(true);
      await axios.post(`${domainUrl}users/login/`, {
        email: userData.email.toLowerCase(),
        password: userData.password,
      });

      toast.success("OTP resent to your email.");
      setResendTimer(60);
      setResendDisabled(true);
      setOtp("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#203a43] px-2">
      <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-md sm:max-w-lg md:max-w-xl transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <img
            src={Logo}
            alt="Logo"
            className="rounded-2xl h-24 w-24 object-contain border-4 border-blue-200 shadow-lg mb-2 bg-white"
          />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-400 drop-shadow-sm tracking-tight mt-2">
            UpStocks
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-4">
            {showOtp ? "Enter OTP" : "Sign in to your account"}
          </h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            {showOtp
              ? "We have sent an OTP to your email."
              : "Welcome back! Please enter your details."}
          </p>
        </div>

        {!showOtp ? (
          <form onSubmit={handleSubmitAdmin} className="space-y-6">
            {/* Email */}
            <div>
              <label
                className="block text-gray-700 mb-1 font-medium"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="border border-gray-300 rounded-xl px-4 py-3 w-full bg-gray-50 text-gray-800"
                value={userData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-gray-700 mb-1 font-medium"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="border border-gray-300 rounded-xl px-4 py-3 w-full pr-12 bg-gray-50 text-gray-800"
                  value={userData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 012.1-3.36m3.1-2.88A9.97 9.97 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-2.1 3.36m-3.1 2.88A9.97 9.97 0 0112 19c-1.07 0-2.1-.13-3.09-.37M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg text-lg"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="flex justify-center">
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                inputType="tel"
                renderInput={(props) => (
                  <input
                    {...props}
                    placeholder="-"
                    style={{
                      fontSize: "2rem",
                      height: "3.2rem",
                      width: "2.8rem",
                      margin: "0.3rem",
                      padding: "0.2rem 0",
                      textAlign: "center",
                      borderRadius: "0.75rem",
                      border: "2px solid #3b82f6",
                      backgroundColor: "#f8fafc",
                      outline: "none",
                    }}
                  />
                )}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                className={`font-medium ${
                  resendDisabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:underline"
                }`}
                onClick={handleResendOtp}
                disabled={resendDisabled || resendLoading}
              >
                {resendLoading
                  ? "Sending..."
                  : `Resend OTP${resendDisabled ? ` in ${resendTimer}s` : ""}`}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg text-lg"
            >
              {loading ? "Verifying..." : "Submit OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
