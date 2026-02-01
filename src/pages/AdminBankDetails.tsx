import { useState, useEffect } from "react";
import axios from "axios";
import { domainUrl } from "../utils/constants";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface BankDetails {
  bank_account_holder_name: string;
  bank_account_number: string;
  bank_ifsc_code: string;
  bank_name: string;
  bank_branch: string;
  upi_id: string;
  pan_number: string;
  gstin: string;
  bank_details_verified: boolean;
  bank_verified_at: string | null;
}

const AdminBankDetails = () => {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bank_account_holder_name: "",
    bank_account_number: "",
    bank_ifsc_code: "",
    bank_name: "",
    bank_branch: "",
    upi_id: "",
    pan_number: "",
    gstin: "",
    bank_details_verified: false,
    bank_verified_at: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${domainUrl}users/bank-details/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBankDetails(response.data);
    } catch (error: any) {
      console.error("Error fetching bank details:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to load bank details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.put(
        `${domainUrl}users/bank-details/`,
        bankDetails,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBankDetails(response.data.data);
      setMessage({
        type: "success",
        text: "Bank details updated successfully! Verification status has been reset.",
      });
    } catch (error: any) {
      console.error("Error updating bank details:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.error || "Failed to update bank details",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BanknotesIcon className="h-10 w-10 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Bank Account Details</h1>
          </div>
          <p className="text-gray-400 ml-13">
            Manage your bank account information for receiving settlements
          </p>
        </div>

        {/* Verification Status Banner */}
        {bankDetails.bank_details_verified ? (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">
                  Bank Details Verified ✓
                </p>
                <p className="text-green-300/70 text-sm">
                  Verified on{" "}
                  {new Date(bankDetails.bank_verified_at!).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ) : bankDetails.bank_account_number ? (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-semibold">
                  Pending Verification
                </p>
                <p className="text-yellow-300/70 text-sm">
                  Your bank details are awaiting owner verification
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <InformationCircleIcon className="h-6 w-6 text-blue-400" />
              <div>
                <p className="text-blue-400 font-semibold">
                  Complete Your Profile
                </p>
                <p className="text-blue-300/70 text-sm">
                  Add your bank details to receive settlement payments
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/30"
                : message.type === "error"
                ? "bg-red-500/10 border border-red-500/30"
                : "bg-blue-500/10 border border-blue-500/30"
            }`}
          >
            <p
              className={`${
                message.type === "success"
                  ? "text-green-400"
                  : message.type === "error"
                  ? "text-red-400"
                  : "text-blue-400"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bank Account Information */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Bank Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  name="bank_account_holder_name"
                  value={bankDetails.bank_account_holder_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="As per bank records"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="bank_account_number"
                  value={bankDetails.bank_account_number}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  name="bank_ifsc_code"
                  value={bankDetails.bank_ifsc_code}
                  onChange={handleInputChange}
                  required
                  maxLength={11}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., SBIN0001234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={bankDetails.bank_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., State Bank of India"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  name="bank_branch"
                  value={bankDetails.bank_branch}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Branch name (optional)"
                />
              </div>
            </div>
          </div>

          {/* Alternative Payment Methods */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Alternative Payment Method
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                UPI ID (Optional)
              </label>
              <input
                type="text"
                name="upi_id"
                value={bankDetails.upi_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="yourname@upi"
              />
            </div>
          </div>

          {/* KYC Information */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              KYC Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="pan_number"
                  value={bankDetails.pan_number}
                  onChange={handleInputChange}
                  maxLength={10}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="ABCDE1234F"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={bankDetails.gstin}
                  onChange={handleInputChange}
                  maxLength={15}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                saving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {saving ? "Saving..." : "Save Bank Details"}
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">
            <strong>Security Note:</strong> Your bank details are securely stored
            and will be verified by the platform owner before settlements can be
            processed. If you update your account number or IFSC code, your
            verification status will be reset and require re-verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminBankDetails;
