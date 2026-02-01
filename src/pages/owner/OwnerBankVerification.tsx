import { useState, useEffect } from "react";
import axios from "axios";
import { domainUrl } from "../../utils/constants";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface AdminBankDetails {
  user_id: number;
  username: string;
  email: string;
  phone_number: string;
  bank_account_holder_name: string;
  bank_account_number: string;
  bank_account_number_masked: string;
  bank_ifsc_code: string;
  bank_name: string;
  bank_branch: string;
  upi_id: string;
  pan_number: string;
  gstin: string;
  bank_details_verified: boolean;
  bank_verified_at: string | null;
  created_at: string;
}

const OwnerBankVerification = () => {
  const [admins, setAdmins] = useState<AdminBankDetails[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminBankDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedAdmin, setSelectedAdmin] = useState<AdminBankDetails | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchAdminBankDetails();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [admins, searchTerm, filterStatus]);

  const fetchAdminBankDetails = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${domainUrl}users/owner/bank-details/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data.results);
      setFilteredAdmins(response.data.results);
    } catch (error) {
      console.error("Error fetching admin bank details:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAdmins = () => {
    let filtered = [...admins];

    // Filter by verification status
    if (filterStatus === "verified") {
      filtered = filtered.filter((admin) => admin.bank_details_verified);
    } else if (filterStatus === "unverified") {
      filtered = filtered.filter((admin) => !admin.bank_details_verified);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter(
        (admin) =>
          !admin.bank_details_verified && admin.bank_account_number
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (admin) =>
          admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.phone_number.includes(searchTerm)
      );
    }

    setFilteredAdmins(filtered);
  };

  const handleVerify = async (adminId: number, action: "approve" | "reject") => {
    setVerifying(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${domainUrl}users/owner/bank-details/${adminId}/verify/`,
        { action },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh the list
      await fetchAdminBankDetails();
      setShowModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error verifying bank details:", error);
      alert("Failed to verify bank details");
    } finally {
      setVerifying(false);
    }
  };

  const openDetailsModal = (admin: AdminBankDetails) => {
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const getStatusBadge = (admin: AdminBankDetails) => {
    if (admin.bank_details_verified) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Verified
        </span>
      );
    } else if (admin.bank_account_number) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          <ClockIcon className="h-4 w-4 mr-1" />
          Pending
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
          <XCircleIcon className="h-4 w-4 mr-1" />
          Not Submitted
        </span>
      );
    }
  };

  const stats = {
    total: admins.length,
    verified: admins.filter((a) => a.bank_details_verified).length,
    pending: admins.filter((a) => !a.bank_details_verified && a.bank_account_number)
      .length,
    notSubmitted: admins.filter((a) => !a.bank_account_number).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Bank Verification
          </h1>
          <p className="text-gray-300">
            Review and verify admin bank account details
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p className="text-gray-300 text-sm mb-1">Total Admins</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-green-500/10 backdrop-blur-sm rounded-lg p-4 border border-green-500/30">
            <p className="text-green-300 text-sm mb-1">Verified</p>
            <p className="text-3xl font-bold text-green-400">{stats.verified}</p>
          </div>
          <div className="bg-yellow-500/10 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30">
            <p className="text-yellow-300 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-gray-500/10 backdrop-blur-sm rounded-lg p-4 border border-gray-500/30">
            <p className="text-gray-300 text-sm mb-1">Not Submitted</p>
            <p className="text-3xl font-bold text-gray-400">
              {stats.notSubmitted}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending Verification</option>
                <option value="unverified">Not Verified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admin List */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Admin Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Bank Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Account Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    IFSC Code
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr
                      key={admin.user_id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{admin.username}</p>
                          <p className="text-gray-400 text-sm">{admin.email}</p>
                          <p className="text-gray-400 text-sm">
                            {admin.phone_number}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {admin.bank_name || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {admin.bank_account_number_masked || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {admin.bank_ifsc_code || "-"}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(admin)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openDetailsModal(admin)}
                          className="text-purple-400 hover:text-purple-300 font-medium text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Bank Details - {selectedAdmin.username}
            </h2>

            <div className="space-y-4">
              {/* Admin Info */}
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Admin Information
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-400">Email:</p>
                  <p className="text-white">{selectedAdmin.email}</p>
                  <p className="text-gray-400">Phone:</p>
                  <p className="text-white">{selectedAdmin.phone_number}</p>
                  <p className="text-gray-400">Joined:</p>
                  <p className="text-white">
                    {new Date(selectedAdmin.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Bank Account Details
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-400">Account Holder:</p>
                  <p className="text-white">
                    {selectedAdmin.bank_account_holder_name || "-"}
                  </p>
                  <p className="text-gray-400">Account Number:</p>
                  <p className="text-white font-mono">
                    {selectedAdmin.bank_account_number || "-"}
                  </p>
                  <p className="text-gray-400">IFSC Code:</p>
                  <p className="text-white">{selectedAdmin.bank_ifsc_code || "-"}</p>
                  <p className="text-gray-400">Bank Name:</p>
                  <p className="text-white">{selectedAdmin.bank_name || "-"}</p>
                  <p className="text-gray-400">Branch:</p>
                  <p className="text-white">{selectedAdmin.bank_branch || "-"}</p>
                  <p className="text-gray-400">UPI ID:</p>
                  <p className="text-white">{selectedAdmin.upi_id || "-"}</p>
                </div>
              </div>

              {/* KYC Details */}
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  KYC Information
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-400">PAN Number:</p>
                  <p className="text-white">{selectedAdmin.pan_number || "-"}</p>
                  <p className="text-gray-400">GSTIN:</p>
                  <p className="text-white">{selectedAdmin.gstin || "-"}</p>
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Verification Status
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-400">Status:</p>
                  <div>{getStatusBadge(selectedAdmin)}</div>
                  {selectedAdmin.bank_verified_at && (
                    <>
                      <p className="text-gray-400">Verified At:</p>
                      <p className="text-white">
                        {new Date(
                          selectedAdmin.bank_verified_at
                        ).toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                disabled={verifying}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              {!selectedAdmin.bank_details_verified &&
                selectedAdmin.bank_account_number && (
                  <>
                    <button
                      onClick={() => handleVerify(selectedAdmin.user_id, "reject")}
                      disabled={verifying}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {verifying ? "Processing..." : "Reject"}
                    </button>
                    <button
                      onClick={() =>
                        handleVerify(selectedAdmin.user_id, "approve")
                      }
                      disabled={verifying}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {verifying ? "Processing..." : "Approve"}
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBankVerification;
