import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { domainUrl } from "../utils/constants";
import axios from "axios";
import Logo from "../assets/logo.png";
import OtpInput from "react-otp-input";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

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
        resp.data.user.default_shipping_address || "",
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
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4 transition-colors duration-500">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img
              src={Logo}
              alt="Logo"
              className="h-16 w-16 object-contain rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            {showOtp ? "Verify OTP" : "Welcome Back"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {showOtp
              ? "Enter the 6-digit code sent to your email"
              : "Sign in to access your dashboard"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-8">
            {!showOtp ? (
              <form onSubmit={handleSubmitAdmin} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400"
                      value={userData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg pl-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400"
                      value={userData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {/* OTP Input */}
                <div className="space-y-4">
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
                          className="!w-12 !h-14 mx-1.5 text-center text-2xl font-bold bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
                        />
                      )}
                    />
                  </div>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <button
                      type="button"
                      className={`text-sm font-medium transition-colors ${
                        resendDisabled
                          ? "text-zinc-400 cursor-not-allowed"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                      }`}
                      onClick={handleResendOtp}
                      disabled={resendDisabled || resendLoading}
                    >
                      {resendLoading
                        ? "Sending..."
                        : resendDisabled
                          ? `Resend OTP in ${resendTimer}s`
                          : "Resend OTP"}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify & Continue"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
          © 2026 UpStocks. All rights reserved.
        </p>
      </div>
    </div>
  );
}
