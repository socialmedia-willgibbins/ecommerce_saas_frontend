import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import axios from "axios";
import toast from "react-hot-toast";
import { domainUrl, logOutHandler } from "../utils/constants";
import OTPInput from "react-otp-input";
const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Send OTP API
  const sendOtp = async (email: string) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (!email) {
        setError("Please enter a valid email address.");
        toast.error("Please enter a valid email address.");
        setLoading(false);
        return;
      }
      const body = { email };
      const resp = await axios.post(`${domainUrl}users/forgot-password/`, body);
      if (resp.data) {
        setStep("otp");
        setMessage(resp.data.message || "OTP sent to your email.");
        toast.success(resp.data.message || "OTP sent to your email.");
      }
    } catch (err: any) {
      if (err.response?.data.code === "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired. Please log in again.");
        return;
      }
      setError(err?.response?.data?.message || "Failed to send OTP.");
      toast.error(err?.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password API
  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string
  ) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (!email || !otp || !newPassword) {
        setError("Please fill all fields.");
        toast.error("Please fill all fields.");
        setLoading(false);
        return;
      }
      const body = {
        otp,
        email,
        new_password: newPassword,
      };
      const resp = await axios.post(`${domainUrl}users/reset-password/`, body);
      if (resp.data) {
        setMessage(
          resp.data.message ||
            "Password reset successful! Redirecting to login..."
        );
        toast.success(resp.data.message || "Password reset successful!");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err: any) {
      if (err.response?.data.code === "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired. Please log in again.");
        return;
      }
      setError(err?.response?.data?.message || "Invalid OTP or password.");
      toast.error(err?.response?.data?.message || "Invalid OTP or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtp(email);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email, otp, newPassword);
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
            {step === "email" ? "Forgot Password" : "Reset Password"}
          </h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            {step === "email"
              ? "Enter your email address and we'll send you an OTP."
              : "Enter the OTP sent to your email and set a new password."}
          </p>
        </div>
        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            {message && (
              <div className="text-green-600 text-sm text-center">
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg text-lg"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-6">
            <div className="flex justify-center">
              <OTPInput
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
            <div>
              <label
                className="block text-gray-700 mb-1 font-medium"
                htmlFor="newPassword"
              >
                New Password
              </label>
              <input
                ref={passwordInputRef}
                id="newPassword"
                type="password"
                placeholder="New Password"
                className="border border-gray-300 rounded-xl px-4 py-3 w-full bg-gray-50 text-gray-800"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            {message && (
              <div className="text-green-600 text-sm text-center">
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg text-lg"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
