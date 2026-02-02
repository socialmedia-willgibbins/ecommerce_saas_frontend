import React, { useEffect, useState, Fragment, useRef } from "react";
import axios from "axios";
import { domainUrl, logOutHandler } from "../../utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

// --- Heroicons ---
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TruckIcon,
  MapPinIcon,
  CubeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

// --- Types ---
type User = {
  user_id: number;
  username: string;
  email: string;
  phone_number: string;
  default_shipping_address: string;
  role: string;
};

type Category = {
  category_id: number;
  images: { id: number; url: string; type: string }[];
  name: string;
  description: string;
  category_code: string;
  is_active: boolean;
};

type ProductDetails = {
  product_id: number;
  product_code: string;
  name: string;
  description: string;
  price: string;
  discount_percentage: string;
  offer_price: number;
  stock: number;
  category: Category;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  favorite_count: number;
  images: { id: number; url: string; type: string }[];
};

type OrderDetail = {
  order_detail_id: number;
  order: number;
  product: number;
  product_details: ProductDetails;
  quantity: number;
  price_at_purchase: string;
  is_active: boolean;
};

type Order = {
  order_id: number;
  user: User;
  total_price: string;
  shipping_address: string;
  status: string;
  tracking_id: string;
  created_at: string;
  order_details: OrderDetail[];
  is_active: boolean;
};

const statusOptions = ["Processing", "Shipped", "Delivered"];

// --- Expandable Row Component ---
const ExpandableRow: React.FC<{
  expanded: boolean;
  colSpan: number;
  children: React.ReactNode;
}> = ({ expanded, colSpan, children }) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (expanded && ref.current) {
      setHeight(ref.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [expanded, children]);

  return (
    <tr
      style={{
        height: expanded ? height : 0,
        display: expanded || height > 0 ? "table-row" : "none",
      }}
      className="bg-zinc-50/50 dark:bg-zinc-900/30 transition-all duration-300 ease-in-out overflow-hidden"
      aria-hidden={!expanded}
    >
      <td colSpan={colSpan} className="p-0 border-0">
        <div
          ref={ref as any}
          className={`transition-opacity duration-300 ease-in-out ${expanded ? "opacity-100 p-4" : "opacity-0 p-0"}`}
        >
          {children}
        </div>
      </td>
    </tr>
  );
};

export const ListAllOrdersTable = () => {
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();
  
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Order[]>(`${domainUrl}orders/all`, {
        params: {
          page: page + 1,
          page_size: rowsPerPage,
          search: search || undefined,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      });
      // Assuming API returns all, filtering client-side for "pending" removal as per original code logic
      const filtered = response.data.filter(
        (order) => order.status.toLowerCase() !== "pending"
      );
      setOrders(filtered);
    } catch (err: any) {
      if (err.response?.data.code === "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired.", { position: "top-right" });
        return;
      }
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, rowsPerPage, search]);

  // Handlers
  const handleRefresh = () => fetchOrders();
  const handleChangePage = (newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };
  const handleExpand = (orderId: number) => {
    setExpanded((prev) => (prev === orderId ? null : orderId));
  };
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await axios.put(
        `${domainUrl}orders/order/${orderId}/`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      toast.success("Order status updated");
      fetchOrders();
    } catch (err: any) {
        toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.ceil(orders.length / rowsPerPage);
  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Format currency
  const formatPrice = (amount: string) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(amount));

  return (
    <div className="min-h-screen bg-gray-50 rounded-2xl dark:bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Orders</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Track and manage customer orders and shipments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.success("Exporting Orders...")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* --- Toolbar --- */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6 p-4 flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg relative group">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm text-zinc-900 dark:text-white transition-all placeholder:text-zinc-400"
                placeholder="Search orders, customers, tracking..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={loading}
              />
            </form>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all">
                <FunnelIcon className="h-4 w-4" />
                Filter
              </button>
              <button
                type="button"
                className="p-2.5 text-zinc-500 hover:text-black dark:hover:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors"
                onClick={handleRefresh}
                disabled={loading}
                title="Refresh Data"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
        </div>

        {/* --- Error State --- */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400">
            <XCircleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* --- Data Table --- */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  {[
                    { label: "Order ID", width: "w-[10%]" },
                    { label: "Customer", width: "w-[15%]" },
                    { label: "Status", width: "w-[15%]" },
                    { label: "Total", width: "w-[10%]" },
                    { label: "Date", width: "w-[15%]" },
                    { label: "Shipping To", width: "w-[20%]" },
                    { label: "Tracking", width: "w-[10%]" },
                    { label: "", width: "w-[5%]" }
                  ].map((header, idx) => (
                    <th key={idx} className={`px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ${header.width}`}>
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <ArrowPathIcon className="h-8 w-8 mx-auto text-zinc-300 animate-spin" />
                      <p className="mt-2 text-sm text-zinc-500">Loading orders...</p>
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <CubeIcon className="h-12 w-12 mx-auto text-zinc-400" />
                      <p className="text-sm font-medium text-zinc-900 dark:text-white mt-2">No orders found</p>
                      <p className="text-xs text-zinc-500 mt-1">Try adjusting your search terms.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <Fragment key={order.order_id}>
                      <tr className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        
                        {/* Order ID */}
                        <td className="px-6 py-4">
                           <span className="font-mono text-xs font-medium text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                              #{order.order_id}
                           </span>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                 {order.user.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[120px]">{order.user.username}</span>
                           </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-6 py-4">
                           <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                              disabled={updatingId === order.order_id || loading}
                              className={`text-xs font-medium rounded-lg border-0 py-1.5 pl-3 pr-8 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-700 focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-zinc-900 dark:text-white cursor-pointer disabled:opacity-50`}
                           >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                           </select>
                        </td>

                        {/* Total Price */}
                        <td className="px-6 py-4">
                           <span className="text-sm font-bold text-zinc-900 dark:text-white">{formatPrice(order.total_price)}</span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                           <span className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(order.created_at).toLocaleDateString()}</span>
                           <span className="block text-[10px] text-zinc-400">{new Date(order.created_at).toLocaleTimeString()}</span>
                        </td>

                        {/* Address */}
                        <td className="px-6 py-4">
                           <div className="flex items-start gap-2">
                              <MapPinIcon className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                              <span className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2" title={order.shipping_address}>
                                 {order.shipping_address}
                              </span>
                           </div>
                        </td>

                        {/* Tracking */}
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <TruckIcon className="h-4 w-4 text-zinc-400" />
                              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{order.tracking_id || "-"}</span>
                           </div>
                        </td>

                        {/* Expand Button */}
                        <td className="px-6 py-4 text-right">
                           <button
                              onClick={() => handleExpand(order.order_id)}
                              className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                           >
                              {expanded === order.order_id ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                           </button>
                        </td>
                      </tr>

                      {/* --- Expanded Details --- */}
                      <ExpandableRow expanded={expanded === order.order_id} colSpan={8}>
                         <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-inner">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                               <CubeIcon className="h-4 w-4" /> Order Items
                            </h4>
                            <div className="overflow-x-auto">
                               <table className="w-full text-xs text-left">
                                  <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                                     <tr>
                                        <th className="px-4 py-2 font-semibold">Product</th>
                                        <th className="px-4 py-2 font-semibold">Code</th>
                                        <th className="px-4 py-2 font-semibold">Qty</th>
                                        <th className="px-4 py-2 font-semibold">Unit Price</th>
                                        <th className="px-4 py-2 font-semibold">Total</th>
                                     </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                     {order.order_details.map((detail) => (
                                        <tr key={detail.order_detail_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                           <td className="px-4 py-3">
                                              <div className="flex items-center gap-3">
                                                 <div className="h-8 w-8 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                                                    {detail.product_details.images[0]?.url ? (
                                                       <img src={detail.product_details.images[0].url} className="h-full w-full object-cover" alt="" />
                                                    ) : (
                                                       <CubeIcon className="h-4 w-4 text-zinc-300" />
                                                    )}
                                                 </div>
                                                 <span className="font-medium text-zinc-900 dark:text-white">{detail.product_details.name}</span>
                                              </div>
                                           </td>
                                           <td className="px-4 py-3 font-mono text-zinc-500">{detail.product_details.product_code}</td>
                                           <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">{detail.quantity}</td>
                                           <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{formatPrice(detail.price_at_purchase)}</td>
                                           <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">
                                              {formatPrice((parseFloat(detail.price_at_purchase) * detail.quantity).toString())}
                                           </td>
                                        </tr>
                                     ))}
                                  </tbody>
                               </table>
                            </div>
                         </div>
                      </ExpandableRow>
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- Pagination Footer --- */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <span>Rows:</span>
                <select value={rowsPerPage} onChange={handleChangeRowsPerPage} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white">
                   {[5, 10, 20, 50].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
             </div>
             <div className="flex items-center gap-1">
                <button onClick={() => handleChangePage(page - 1)} disabled={page === 0 || loading} className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-500 transition-colors">
                   <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono text-zinc-900 dark:text-white px-2">Page {page + 1} of {totalPages || 1}</span>
                <button onClick={() => handleChangePage(page + 1)} disabled={page + 1 >= totalPages || loading} className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-500 transition-colors">
                   <ChevronRightIcon className="h-4 w-4" />
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};