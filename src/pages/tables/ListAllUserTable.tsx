import React, { useEffect, useState } from "react";
import axios from "axios";
import { domainUrl, logOutHandler } from "../../utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

// --- Heroicons ---
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,

  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,

  XCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,

  MapPinIcon,

} from "@heroicons/react/24/outline";

// --- Types ---
type User = {
  user_id: number;
  username: string;
  email: string;
  phone_number: string;
  role: string;
  default_shipping_address?: string;
};

type UserApiResponse = {
  results: User[];
  count: number;
};

type SortConfig = {
  key: keyof User;
  direction: "asc" | "desc";
};

// --- Styling Constants ---
const roleStyles: Record<string, string> = {
  admin: "bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900",
  staff: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700",
  customer: "bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
  user: "bg-white text-zinc-500 border-zinc-100",
};

// const statusStyles: Record<string, string> = {
//   active: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
//   inactive: "text-zinc-500 bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
// };

export const ListAllUserTable = () => {
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();
  
  // --- State ---
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "user_id", direction: "asc" });
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [showFilters] = useState(false);

  // --- Logic ---
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<UserApiResponse>(
        `${domainUrl}users/admin/list/`,
        {
          params: {
            page: page + 1,
            page_size: rowsPerPage,
            globalFilter: search || undefined,
            ...(filters.role && { role: filters.role }),
            ...(filters.status && { status: filters.status }),
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      // Mock data injection preserved
     
      console.log(response.data.results);

      const filteredData = response.data.results.filter(user => (user.role == 'customer'|| user.role == 'staff' ));

      setUsers(filteredData);
      setTotal(filteredData.length);
    } catch (err: any) {
      if (err.response?.data.code === "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired.", { position: "top-right" });
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load users.");
      toast.error("Failed to load users.", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, rowsPerPage, search, filters]);

  const handleRefresh = () => { setSelectedUsers([]); fetchUsers(); };
  const handleChangePage = (newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (value: number) => { setRowsPerPage(value); setPage(0); };
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(0); setSearch(searchInput.trim()); };
  
  const handleSort = (key: keyof User) => {
    setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc" });
  };



  // const handleExport = () => toast.success("Exporting data...", { position: "top-center" });
  const handleBulkAction = (action: string) => {
    toast.success(`${action} ${selectedUsers.length} users`, { position: "top-center" });
    setSelectedUsers([]);
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aValue: any = a[sortConfig.key];
    const bValue: any = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(total / rowsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 rounded-2xl dark:bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Directory</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage user access, roles, and status.
            </p>
          </div>
          <div className="flex items-center gap-3">
         
            <button
              onClick={() => navigate("/add-user")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-all shadow-lg shadow-zinc-200 dark:shadow-none"
            >
              <UserPlusIcon className="h-4 w-4 stroke-2" />
              Add User
            </button>
          </div>
        </div>

        {/* --- Toolbar Section --- */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6 overflow-hidden">
          <div className="p-4 flex flex-col lg:flex-row gap-4 justify-between">
            
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg relative group">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-sm text-zinc-900 dark:text-white transition-all placeholder:text-zinc-400"
                placeholder="Search users by name, email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={loading}
              />
            </form>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                  showFilters || filters.role || filters.status
                    ? "bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-600"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"
                }`}
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
                {(filters.role || filters.status) && (
                  <span className="flex h-2 w-2 rounded-full bg-black dark:bg-white" />
                )}
              </button> */}
              
              <button
                onClick={handleRefresh}
                className="p-2.5 text-zinc-500 hover:text-black dark:hover:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors"
                title="Refresh List"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="px-4 pb-4 pt-0 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
              <div className="flex flex-wrap items-end gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="block w-40 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="block w-40 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                {(filters.role || filters.status) && (
                  <button
                    onClick={() => setFilters({ role: "", status: "" })}
                    className="mb-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
                  >
                    <XCircleIcon className="h-4 w-4" /> Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Bulk Selection Bar */}
          {selectedUsers.length > 0 && (
            <div className="bg-zinc-900 dark:bg-zinc-100 px-4 py-3 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center bg-white dark:bg-black text-black dark:text-white h-5 w-5 rounded text-xs font-bold">
                     {selectedUsers.length}
                  </span>
                  <span className="text-sm font-medium text-white dark:text-black">Selected</span>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => handleBulkAction("Activate")} className="px-3 py-1.5 text-xs font-bold bg-white/10 dark:bg-black/10 text-white dark:text-black rounded hover:bg-white/20 dark:hover:bg-black/20 transition-colors">Activate</button>
                  <button onClick={() => handleBulkAction("Delete")} className="px-3 py-1.5 text-xs font-bold bg-red-500/20 text-red-400 dark:text-red-600 rounded hover:bg-red-500/30 transition-colors">Delete</button>
                  <button onClick={() => setSelectedUsers([])} className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white dark:hover:text-black transition-colors">Cancel</button>
               </div>
            </div>
          )}
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
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="w-12 px-6 py-4">
                    {/* <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-white"
                    /> */}
                  </th>
                  {[
                    { key: "username", label: "User Profile" },
                    { key: "role", label: "Role" },
                    { key: "phone_number", label: "Contact" },
                    { key: "default_shipping_address", label: "Address" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-black dark:hover:text-white transition-colors group"
                      onClick={() => handleSort(key as keyof User)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <span className="text-zinc-300 group-hover:text-zinc-500">
                           {sortConfig.key === key ? (
                             sortConfig.direction === "asc" ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />
                           ) : <div className="h-3 w-3" />}
                        </span>
                      </div>
                    </th>
                  ))}
                  {/* <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <ArrowPathIcon className="h-8 w-8 mx-auto text-zinc-300 animate-spin" />
                      <p className="mt-2 text-sm text-zinc-500">Loading directory...</p>
                    </td>
                  </tr>
                ) : sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="h-12 w-12 mx-auto bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                         <MagnifyingGlassIcon className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">No users found</p>
                      <p className="text-xs text-zinc-500 mt-1">Try adjusting your filters or search terms.</p>
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((user) => (
                    <tr 
                      key={user.user_id} 
                      className={`group transition-colors ${
                        selectedUsers.includes(user.user_id) 
                        ? "bg-zinc-50 dark:bg-zinc-900/50" 
                        : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                      }`}
                    >
                      <td className="px-6 py-4">
                        {/* <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.user_id)}
                          onChange={() => handleSelectUser(user.user_id)}
                          className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-white"
                        /> */}
                      </td>
                      
                      {/* User Profile Cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-sm border border-zinc-200 dark:border-zinc-700">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">{user.username}</p>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                               <EnvelopeIcon className="h-3 w-3" />
                               {user.email}
                            </div>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">ID: {user.user_id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Cell */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${roleStyles[user.role] || roleStyles.user}`}>
                           {user.role === 'admin' && <ShieldCheckIcon className="h-3 w-3 mr-1" />}
                           {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>

                      {/* Contact Cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <PhoneIcon className="h-4 w-4 text-zinc-400" />
                          <span className="font-mono">{user.phone_number}</span>
                        </div>
                      </td>

                      {/* Status Cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <MapPinIcon className="h-4 w-4 text-zinc-400" />
                          {user.default_shipping_address ? (
                            <span className="font-mono">{user.default_shipping_address}</span>
                          ) : (
                            <span className="font-mono text-zinc-400">No Address</span>
                          )}
                        </div>
                      </td>

                      {/* Date Cell */}
                      {/* <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                           <CalendarDaysIcon className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                           <span className="font-mono text-xs">{user.created_at}</span>
                        </div>
                      </td> */}

                      {/* Actions Cell */}
                      {/* <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="View Profile">
                               <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Edit User">
                               <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Delete">
                               <TrashIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                               <EllipsisHorizontalIcon className="h-4 w-4" />
                            </button>
                         </div>
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- Pagination Footer --- */}
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                   <span>Showing <span className="font-bold text-zinc-900 dark:text-white">{Math.min(rowsPerPage * page + 1, total)}</span> to <span className="font-bold text-zinc-900 dark:text-white">{Math.min(rowsPerPage * (page + 1), total)}</span> of <span className="font-bold text-zinc-900 dark:text-white">{total}</span> users</span>
                   <select
                      value={rowsPerPage}
                      onChange={(e) => handleChangeRowsPerPage(parseInt(e.target.value))}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                   >
                      {[10, 25, 50, 100].map(opt => <option key={opt} value={opt}>Show {opt}</option>)}
                   </select>
                </div>

                <div className="flex items-center gap-1">
                   <button
                      onClick={() => handleChangePage(page - 1)}
                      disabled={page === 0 || loading}
                      className="px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                   >
                      Previous
                   </button>
                   {/* Simplified Pagination Numbers */}
                   <div className="flex items-center gap-1 px-2">
                      <span className="text-xs font-mono text-zinc-900 dark:text-white">Page {page + 1} of {totalPages}</span>
                   </div>
                   <button
                      onClick={() => handleChangePage(page + 1)}
                      disabled={page + 1 >= totalPages || loading}
                      className="px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                   >
                      Next
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};