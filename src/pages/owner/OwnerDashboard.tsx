/**
 * Owner Dashboard - Main Overview Page
 * Shows platform statistics, revenue, and top performing admins
 * Matching Admin UI style
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApiService } from "../../services/owner/ownerApi";
import type { DashboardStats } from "../../services/owner/ownerApi";
import {
  UsersIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await ownerApiService.getDashboard();
      setStats(data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("Access denied. You must be a platform owner to view this page.");
        setTimeout(() => navigate("/owner/login"), 2000);
      } else {
        setError(err.response?.data?.error || "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/owner/login");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#f7faf7] via-[#f4f7f2] to-[#e2eee3] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#f7faf7] via-[#f4f7f2] to-[#e2eee3] flex items-center justify-center">
        <div className="max-w-md text-center bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchDashboard}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const platformStats = [
    {
      label: "Total Admins",
      value: stats.statistics.total_admins.toString(),
      icon: BuildingStorefrontIcon,
      helper: "Platform admins",
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Total Customers",
      value: stats.statistics.total_customers.toString(),
      icon: UsersIcon,
      helper: "Registered users",
      color: "from-emerald-500 to-lime-400",
    },
    {
      label: "Total Orders",
      value: stats.statistics.total_orders.toString(),
      icon: ShoppingCartIcon,
      helper: `${stats.statistics.completed_orders} completed`,
      color: "from-purple-500 to-pink-400",
    },
    {
      label: "Platform Revenue",
      value: formatCurrency(stats.revenue.total_revenue),
      icon: CurrencyDollarIcon,
      helper: `${stats.revenue.commission_percentage}% commission`,
      color: "from-amber-500 to-orange-400",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f7faf7] via-[#f4f7f2] to-[#e2eee3] text-[#263526]">
      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#7f8f7a] font-medium">
              UpStocks Platform · Owner Dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight mt-1">Platform Overview</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor your platform's performance and revenue
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/owner/payment-history")}
              className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-emerald-100/50 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-all shadow-sm"
            >
              💰 Payment History
            </button>
            <button
              onClick={() => navigate("/owner/admins")}
              className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-emerald-100/50 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-all shadow-sm"
            >
              👥 Manage Admins
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-100 transition-all shadow-sm flex items-center gap-2"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Stat Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {platformStats.map((item) => (
            <div
              key={item.label}
              className="group relative overflow-hidden rounded-2xl border border-emerald-50/70 bg-white/80 p-5 shadow-sm backdrop-blur transition-all hover:shadow-md"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.color}`} />
              <div className="flex justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">{item.value}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{item.helper}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="mt-4 p-2 bg-emerald-50 rounded-full text-[#5e785a]">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Revenue Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white/90 p-6 shadow-sm border border-white">
            <div className="mb-6 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-emerald-600" />
              <h2 className="text-sm font-bold">Revenue Breakdown</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-lime-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-xs text-gray-600 font-medium mb-2">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(stats.revenue.total_revenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">From all completed orders</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-gray-600 font-medium mb-2">Platform Commission</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(stats.revenue.platform_commission)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.revenue.commission_percentage}% of total revenue
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <p className="text-xs text-gray-600 font-medium mb-2">Admin Settlements</p>
                <p className="text-2xl font-bold text-purple-700">
                  {formatCurrency(stats.revenue.admin_settlement_total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Paid to admins</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                Recent Activity (Last 7 Days)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-600 font-medium mb-1">New Orders</p>
                  <p className="text-xl font-bold">{stats.recent_activity.orders_last_7_days}</p>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-600 font-medium mb-1">New Admins</p>
                  <p className="text-xl font-bold">{stats.recent_activity.new_admins_last_7_days}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Admins */}
          <div className="rounded-2xl bg-white/90 p-6 shadow-sm border border-white">
            <h3 className="text-sm font-bold mb-4">Top Performing Admins</h3>
            <div className="space-y-3">
              {stats.top_admins && stats.top_admins.length > 0 ? (
                stats.top_admins.map((admin, index) => (
                  <div
                    key={admin.id}
                    className="flex items-center gap-3 rounded-xl bg-gray-50/50 border border-gray-100 px-4 py-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-lime-400 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{admin.username}</p>
                      <p className="text-[10px] text-gray-500 truncate">{admin.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600">
                        {formatCurrency(admin.total_revenue)}
                      </p>
                      <p className="text-[10px] text-gray-500">{admin.order_count} orders</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No admin activity yet</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Order Status Overview */}
        <section className="rounded-2xl bg-white/90 p-6 shadow-sm border border-white">
          <h3 className="text-sm font-bold mb-4">Order Status Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">
                {stats.statistics.total_orders}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total Orders</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {stats.statistics.completed_orders}
              </div>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">
                {stats.statistics.pending_orders}
              </div>
              <p className="text-xs text-gray-500 mt-1">Pending</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.statistics.total_products}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total Products</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
