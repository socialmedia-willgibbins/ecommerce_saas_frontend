/**
 * Owner Login Page
 * Two-step authentication: Email/Password → OTP Verification
 * Matching admin UI style
 */

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ownerApiService } from '../../services/owner/ownerApi';
import Logo from "../../assets/logo.png";
import OtpInput from "react-otp-input";

export default function OwnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (token && role === 'owner') {
      navigate('/owner/dashboard', { replace: true });
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

  const handleSubmitOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill the required fields");
      toast.error("Please fill the required fields");
      return;
    }
    try {
      setLoading(true);
      const resp = await ownerApiService.requestOTP(email.toLowerCase(), password);
      toast.success(resp.message || 'OTP sent to your email');
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
      const resp = await ownerApiService.verifyOTP(email.toLowerCase(), otp);

      localStorage.setItem("access_token", resp.access);
      localStorage.setItem("refresh_token", resp.refresh);
      localStorage.setItem("role", resp.user.role);
      localStorage.setItem("user_name", resp.user.username || "Platform Owner");
      localStorage.setItem("email", resp.user.email);

      // Verify user is actually an owner
      if (resp.user?.role !== 'owner') {
        toast.error('Access denied. Only platform owners can access this dashboard.');
        localStorage.clear();
        return;
      }

      toast.success("Login successful!");
      navigate("/owner/dashboard");
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
      await ownerApiService.requestOTP(email.toLowerCase(), password);
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
            UpStocks Platform
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-4">
            {showOtp ? "Enter OTP" : "Owner Dashboard Login"}
          </h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            {showOtp
              ? "We have sent an OTP to your email."
              : "Secure login for platform administrators"}
          </p>
        </div>

        {!showOtp ? (
          <form onSubmit={handleSubmitOwner} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/70"
                placeholder="owner@tstocks.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/70"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                An OTP has been sent to <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                Enter 6-Digit OTP
              </label>
              <div className="flex justify-center">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  renderSeparator={<span className="mx-1"></span>}
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="!w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                    />
                  )}
                  inputType="tel"
                  shouldAutoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendDisabled || resendLoading}
                className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendLoading
                  ? "Resending..."
                  : resendDisabled
                  ? `Resend OTP (${resendTimer}s)`
                  : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOtp(false);
                  setOtp("");
                  setError("");
                }}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secured with two-factor OTP authentication
          </p>
        </div>
      </div>
    </div>
  );
}
