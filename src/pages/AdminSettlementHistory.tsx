/**
 * Admin Settlement History Page
 * Shows payment settlements for the logged-in admin
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { domainUrl, logOutHandler } from "../utils/constants";
import toast from "react-hot-toast";
import {
  BanknotesIcon,
  CalendarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface Settlement {
  id: number;
  order: {
    order_id: number;
    total_price: number;
    created_at: string;
  };
  amount: number;
  commission_amount: number;
  status: "completed" | "pending" | "failed";
  initiated_at: string;
  settlement_date: string | null;
  transaction_id: string | null;
  failure_reason: string | null;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Settlement[];
}

export default function AdminSettlementHistory() {
  const navigate = useNavigate();
  const access_token = localStorage.getItem("access_token");

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Summary stats
  const [totalSettled, setTotalSettled] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    fetchSettlements();
  }, [page, statusFilter]);

  const fetchSettlements = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page };
      if (statusFilter) params.status = statusFilter;

      const response = await axios.get<PaginatedResponse>(
        `${domainUrl}settlements/`,
        {
          params,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      setSettlements(response.data.results);
      setTotalCount(response.data.count);

      // Calculate summary stats
      const completed = response.data.results.filter((s) => s.status === "completed");
      setCompletedCount(completed.length);
      setTotalSettled(
        completed.reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0)
      );
      setTotalCommission(
        completed.reduce(
          (sum, s) => sum + parseFloat(s.commission_amount.toString()),
          0
        )
      );
    } catch (err: any) {
      if (err.response?.data?.code === "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired.");
        return;
      }
      setError(err.response?.data?.error || "Failed to load settlements.");
      toast.error("Failed to load settlement history");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircleIcon className="h-4 w-4" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <ClockIcon className="h-4 w-4" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <XCircleIcon className="h-4 w-4" />
            Failed
          </span>
        );
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  if (loading && settlements.length === 0) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#f7faf7] via-[#f4f7f2] to-[#e2eee3] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading settlements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f7faf7] via-[#f4f7f2] to-[#e2eee3] text-[#263526]">
      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#7f8f7a] font-medium">
              Admin Panel · Settlement History
            </p>
            <h1 className="text-3xl font-semibold tracking-tight mt-1">
              Payment Settlements
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your earnings and commission deductions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSettlements}
              disabled={loading}
              className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-emerald-100/50 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-emerald-50/70 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-lime-400" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                  Total Settled
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {formatCurrency(totalSettled)}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  From {completedCount} settlements
                </p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-full text-[#5e785a]">
                <BanknotesIcon className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-50/70 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                  Platform Commission
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {formatCurrency(totalCommission)}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">2% of total revenue</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                <BanknotesIcon className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-50/70 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                  Your Earnings
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {formatCurrency(totalSettled - totalCommission)}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">98% of total revenue</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                <CheckCircleIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-emerald-100/50 rounded-xl p-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </section>

        {/* Settlements Table */}
        <section className="rounded-2xl bg-white/90 shadow-sm border border-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-lime-50 border-b border-emerald-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Order Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Your Earning
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Commission
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <BanknotesIcon className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">No settlements found</p>
                        <p className="text-sm text-gray-400">
                          Your payment settlements will appear here once orders are completed
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  settlements.map((settlement) => (
                    <tr
                      key={settlement.id}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          #{settlement.order.order_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(settlement.order.total_price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-emerald-600">
                          {formatCurrency(settlement.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-600">
                          -{formatCurrency(settlement.commission_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(settlement.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDate(settlement.initiated_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {settlement.transaction_id ? (
                          <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {settlement.transaction_id}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > 10 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {settlements.length} of {totalCount} settlements
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium">Page {page}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={settlements.length < 10}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
