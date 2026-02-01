import React, { useState } from "react";
import axios from "axios";
import { domainUrl, logOutHandler } from "../utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

// --- Heroicons for the High-End Look ---
import {
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface UserData {
  user_name: string;
  phone_number: string;
  email: string;
  role: string;
  password: string;
}

const AddUser: React.FC = () => {
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserData>({
    user_name: "",
    phone_number: "",
    email: "",
    role: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user_name, phone_number, email, role, password } = formData;

    if (!user_name || !phone_number || !email || !role || !password) {
      toast.dismiss();
      toast.error("Please fill all required fields", {
        position: "top-center",
      });
      return;
    }

    try {
      setLoading(true);
      const body = {
        username: user_name,
        phone_number,
        email: email.toLowerCase(),
        role,
        password,
      };

      const resp = await axios.post(`${domainUrl}users/create-user/`, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (resp.data) {
        toast.success("User created successfully", { position: "top-center" });
        setFormData({
          user_name: "",
          phone_number: "",
          email: "",
          role: "",
          password: "",
        });
      }
    } catch (err: any) {
      if (err.response?.data.code === "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
          duration: 3000,
        });
        return;
      }
      const errData = err?.response?.data || {};
      if (errData.email || errData.phone_number) {
        toast.error(`Email or Phone already exists.`, {
          position: "top-center",
        });
      } else {
        toast.error("Something went wrong. Please try again.", {
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Reusable Input Component for Consistency ---
  // const InputField = ({
  //   label,
  //   id,
  //   type = "text",
  //   value,
  //   placeholder,
  //   onChange,
  //   icon: Icon,
  // }: any) => (
  //   <div className="space-y-1.5">
  //     <label
  //       htmlFor={id}
  //       className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
  //     >
  //       {label} <span className="text-red-500">*</span>
  //     </label>
  //     <div className="relative group">
  //       <input
  //         type={type}
  //         id={id}
  //         value={value}
  //         onChange={(e) => onChange(id, e.target.value)}
  //         placeholder={placeholder}
  //         className="w-full bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400"
  //         required
  //       />
  //       {/* Optional Icon indicator on focus/hover logic could go here */}
  //     </div>
  //   </div>
  // );

  return (
    <div className=" bg-gray-50 rounded-2xl dark:bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Create New User
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section (2 Columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Account Details
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Please ensure all personal information is accurate.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* <InputField
                    label="Username"
                    id="user_name"
                    value={formData.user_name}
                    onChange={handleInputChange}
                    placeholder="e.g. johndoe"
                    
                  /> */}
                  <div className="space-y-1.5">
                    <label
                      
                      className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                    >
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        
                        id={'user_name'}
                        value={formData.user_name}
                        onChange={(e) => handleInputChange('user_name', e.target.value)}
                        placeholder={"e.g. johndoe"}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400"
                 
                      />
                      {/* Optional Icon indicator on focus/hover logic could go here */}
                    </div>
                  </div>

                  {/* <InputField
                    label="Phone Number"
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                  /> */}
                  <div className="space-y-1.5">
                    <label
                      
                      className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        type="tel"
                        id={'phone_number'}
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        placeholder={"e.g. 9876543210"}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400"
                        
                        maxLength={10}
                      />
                      {/* Optional Icon indicator on focus/hover logic could go here */}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    {/* <InputField
                      label="Email Address"
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@company.com"
                    /> */}
                    <div className="space-y-1.5">
                    <label
                      
                      className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        id={'email'}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder={"e.g. john@company.com"}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400"
                        
                      />
                      {/* Optional Icon indicator on focus/hover logic could go here */}
                    </div>
               
                      
                  </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="role"
                      className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                    >
                      Access Level <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all appearance-none"
                        
                      >
                        <option value="" disabled>
                          Select role...
                        </option>
                        <option value="staff">Staff</option>
                        <option value="customer">Customer</option>
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-zinc-400">
                        <ShieldCheckIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Password with Toggle */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        placeholder="••••••••"
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400"
                        
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-zinc-200 dark:shadow-none flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <UserPlusIcon className="h-4 w-4 stroke-2" />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Context/Help Sidebar (1 Column) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Security Note */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <ShieldCheckIcon className="h-5 w-5 text-zinc-900 dark:text-white" />
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Security Policy
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                User creation is logged for security purposes. Ensure the
                password meets the minimum requirements:
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  "At least 8 characters",
                  "One uppercase letter",
                  "One number",
                  "One special character",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2"
                  >
                    <div className="h-1 w-1 rounded-full bg-zinc-400"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Role Info */}
            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <InformationCircleIcon className="h-5 w-5 text-zinc-400" />
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Role Definitions
                </h4>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Staff
                  </span>
                  <p className="text-xs text-zinc-500 mt-1">
                    Full access to inventory, sales, and order management.
                    Cannot delete admin accounts.
                  </p>
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Customer
                  </span>
                  <p className="text-xs text-zinc-500 mt-1">
                    Limited access. Can only view their own order history and
                    profile settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
