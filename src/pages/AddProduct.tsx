import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { domainUrl, logOutHandler } from "../utils/constants";
import Select, { type StylesConfig } from "react-select";
import type { SingleValue, ActionMeta } from "react-select";
import { useNavigate } from "react-router";

// --- Heroicons ---
import {
  PhotoIcon,
  CubeIcon,
  TagIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  QrCodeIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";

type Category = {
  category_code: string;
  category_id: number | null;
  description: string;
  images: string[];
  is_active: boolean | null;
  name: string;
};

interface ProductData {
  category_code: string;
  product_code: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  discount_percentage: string;
}

type CategoryOption = { value: number | null; label: string };

// --- Custom Styles for React Select (Zinc Theme) ---
const customSelectStyles = (
  isDarkMode: boolean,
): StylesConfig<CategoryOption> => ({
  control: (provided, state) => ({
    ...provided,
    backgroundColor: isDarkMode ? "#18181b" : "#fff",
    borderColor: isDarkMode ? "#27272a" : "#e4e4e7",
    color: isDarkMode ? "#fff" : "#18181b",
    padding: "0.3rem",
    borderRadius: "0.75rem",
    boxShadow: state.isFocused
      ? isDarkMode
        ? "0 0 0 2px #fff"
        : "0 0 0 2px #000"
      : "none",
    "&:hover": { borderColor: isDarkMode ? "#3f3f46" : "#a1a1aa" },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: isDarkMode ? "#18181b" : "#fff",
    border: `1px solid ${isDarkMode ? "#27272a" : "#e4e4e7"}`,
    borderRadius: "0.75rem",
    zIndex: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? isDarkMode
        ? "#27272a"
        : "#f4f4f5"
      : "transparent",
    color: isDarkMode ? "#fff" : "#18181b",
    cursor: "pointer",
    ":active": { backgroundColor: isDarkMode ? "#3f3f46" : "#e4e4e7" },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: isDarkMode ? "#fff" : "#18181b",
  }),
  input: (provided) => ({
    ...provided,
    color: isDarkMode ? "#fff" : "#18181b",
  }),
});

const AddProduct: React.FC = () => {
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  // Theme Detection
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(
        document.documentElement.classList.contains("dark") ||
          localStorage.getItem("theme") === "dark",
      );
    }
  }, []);

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [productData, setProductData] = useState<ProductData>({
    category_code: "",
    product_code: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    discount_percentage: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const resp = await axios.get(`${domainUrl}products/categories/`, {
          params: { is_active: true },
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const data = resp.data;
        const categories = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];
        if (!Array.isArray(categories))
          throw new Error("Invalid category format");

        const activeCategories = categories.filter(
          (c: any) => c.is_active === true,
        );
        setCategoriesList(activeCategories);
      } catch (err: any) {
        if (err.response?.data.code == "token_not_valid") {
          logOutHandler();
          navigate("/login");
          toast.error("Session expired.", { duration: 3000 });
          return;
        }
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, [access_token]);

  const handleInputChange = (field: keyof ProductData, value: string) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (
    option: SingleValue<CategoryOption>,
    _actionMeta: ActionMeta<CategoryOption>,
  ) => {
    if (!option || option.value === null) {
      setSelectedCategory(null);
      setProductData((prev) => ({ ...prev, category_code: "" }));
      return;
    }
    const cat = categoriesList.find((c) => c.category_id === option.value);
    if (cat) {
      setSelectedCategory(cat);
      setProductData((prev) => ({ ...prev, category_code: cat.category_code }));
    }
  };

  // --- Image Handling ---
  const handleFileValidation = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return false;
    }
    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && handleFileValidation(file)) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (handleFileValidation(file)) {
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const uploadImage = async (product_id: string) => {
    if (!selectedImage) return;
    const formData = new FormData();
    formData.append("normal_image", selectedImage);
    formData.append("product", product_id);
    await axios.post(`${domainUrl}products/uploads/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { category_code, product_code, name, description, price, stock } =
      productData;

    if (
      !category_code ||
      !product_code ||
      !name ||
      !description ||
      !price ||
      !stock
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    if (isNaN(+price) || Number(price) <= 0) {
      toast.error("Price must be a positive number");
      return;
    }
    if (isNaN(+stock) || Number(stock) < 0) {
      toast.error("Stock must be a non-negative number");
      return;
    }
    if (productData.discount_percentage) {
      const discount = Number(productData.discount_percentage);
      if (isNaN(discount) || discount < 0.01 || discount > 99.9) {
        toast.error("Discount percentage must be between 0.01% and 99.9%");
        return;
      }
    }

    setLoading(true);
    try {
      // Validate category is selected
      if (!selectedCategory) {
        toast.error("Please select a category");
        setLoading(false);
        return;
      }

      const body = {
        category: {
          category_code: selectedCategory.category_code,
          name: selectedCategory.name,
          description: selectedCategory.description,
        },
        product_code: productData.product_code,
        name: productData.name,
        description: productData.description,
        price: Number(price),
        stock: Number(stock),
        discount_percentage: productData.discount_percentage ? Number(productData.discount_percentage) : 0,
      };
      const resp = await axios.post(
        `${domainUrl}products/productdetail/`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      if (selectedImage) {
        await uploadImage(resp.data.product_id);
      }

      setProductData({
        category_code: "",
        product_code: "",
        name: "",
        description: "",
        price: "",
        stock: "",
        discount_percentage: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedCategory(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Product created successfully");
    } catch (err: any) {
      if (err.response?.data.code == "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired.");
        return;
      }
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.product_code ||
          "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions: CategoryOption[] = categoriesList.map((cat) => ({
    value: cat.category_id,
    label: cat.name,
  }));

  // --- Reusable Input ---
  // const InputField = ({
  //   label,
  //   id,
  //   value,
  //   onChange,
  //   placeholder,
  //   type = "text",
  //   icon: Icon,
  //   ...props
  // }: any) => (
  //   <div className="space-y-1.5">
  //     <label
  //       htmlFor={id}
  //       className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
  //     >
  //       {label} <span className="text-red-500">*</span>
  //     </label>
  //     <div className="relative group">
  //       {Icon && (
  //         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
  //           <Icon className="h-5 w-5" />
  //         </div>
  //       )}
  //       <input
  //         type={type}
  //         id={id}
  //         value={value}
  //         onChange={onChange}
  //         placeholder={placeholder}
  //         className={`w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-xl py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400 ${
  //           Icon ? "pl-10 pr-4" : "px-4"
  //         }`}
  //         {...props}
  //       />
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-gray-50 rounded-2xl dark:bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        {/* --- Header --- */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Add New Product
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Create a new item in your inventory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT: MAIN FORM (2 Cols) --- */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Product Details
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  General information about the product.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Category & Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Select<CategoryOption, false>
                      inputId="category"
                      options={categoryOptions}
                      value={
                        selectedCategory
                          ? {
                              value: selectedCategory.category_id,
                              label: selectedCategory.name,
                            }
                          : null
                      }
                      onChange={handleCategorySelect}
                      isClearable
                      placeholder="Select Category..."
                      styles={customSelectStyles(isDarkMode)}
                      isLoading={categoriesList.length === 0}
                    />
                  </div>

                  {/* <InputField
                    label="Product Code"
                    id="code"
                    value={productData.product_code}
                    onChange={(e: any) =>
                      handleInputChange("product_code", e.target.value)
                    }
                    placeholder="e.g. PRD-2024-001"
                    icon={QrCodeIcon}
                  /> */}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Product Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                        <QrCodeIcon className="h-5 w-5" />
                      </div>

                      <input
                        // type={type}
                        id="code"
                        value={productData.product_code}
                        onChange={(e: any) =>
                          handleInputChange("product_code", e.target.value)
                        }
                        placeholder="e.g. PRD-2024-001"
                        className={`w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-xl py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400 pl-10 pr-4
                      `}
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                {/* <InputField
                  label="Product Name"
                  id="name"
                  value={productData.name}
                  onChange={(e: any) =>
                    handleInputChange("name", e.target.value)
                  }
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                  icon={TagIcon}
                /> */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                      <TagIcon className="h-5 w-5" />
                    </div>

                    <input
                      // type={type}
                      id="name"
                      value={productData.name}
                      onChange={(e: any) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="e.g. Wireless Noise Cancelling Headphones"
                      className={`w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-xl py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400 pl-10 pr-4
                      `}
                    />
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* <InputField
                    label="Price"
                    id="price"
                    type="number"
                    value={productData.price}
                    onChange={(e: any) =>
                      handleInputChange("price", e.target.value)
                    }
                    placeholder="0.00"
                    icon={CurrencyRupeeIcon}
                    min="0"
                    step="0.01"
                  /> */}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                        <CurrencyRupeeIcon className="h-5 w-5" />
                      </div>

                      <input
                        type="number"
                        id="price"
                        placeholder="0.00"
                        value={productData.price}
                        onChange={(e: any) =>
                          handleInputChange("price", e.target.value)
                        }
                        className={`w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-xl py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400 pl-10 pr-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                      `}
                      />
                    </div>
                  </div>

                  {/* <InputField
                    label="Initial Stock"
                    id="stock"
                    type="number"
                    value={productData.stock}
                    onChange={(e: any) =>
                      handleInputChange("stock", e.target.value)
                    }
                    placeholder="0"
                    icon={CubeIcon}
                    min="0"
                  /> */}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Initial Stock <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                        <CubeIcon className="h-5 w-5" />
                      </div>

                      <input
                        type="number"
                        id="stock"
                        value={productData.stock}
                        placeholder="0"
                        onChange={(e: any) =>
                          handleInputChange("stock", e.target.value)
                        }
                        className={`w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-xl py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400 pl-10 pr-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                      `}
                      />
                    </div>
                  </div>

                  {/* Discount Percentage */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Discount %
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>

                      <input
                        type="number"
                        id="discount_percentage"
                        value={productData.discount_percentage}
                        placeholder="0"
                        min="0.01"
                        max="99.9"
                        step="0.01"
                        onChange={(e: any) =>
                          handleInputChange("discount_percentage", e.target.value)
                        }
                        className={`w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-xl py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400 pl-10 pr-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                      `}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={productData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-xl p-4 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400 resize-none"
                    placeholder="Describe the product features, specs, and benefits..."
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Product Image
                  </label>

                  {!imagePreview ? (
                    <div
                      className={`relative h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        dragActive
                          ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <div className="p-4 rounded-full bg-white dark:bg-zinc-800 shadow-sm mb-3">
                        <CloudArrowUpIcon className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        SVG, PNG, JPG or GIF (max. 2MB)
                      </p>
                    </div>
                  ) : (
                    // --- MODIFIED: CARD PREVIEW STYLE ---
                    <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      <div className="flex items-center gap-4 p-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-16 w-16 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                            {selectedImage?.name || "Uploaded Image"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {selectedImage
                              ? (selectedImage.size / 1024).toFixed(1) + " KB"
                              : "Unknown Size"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }}
                          className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2.5 text-sm font-bold text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-zinc-200 dark:shadow-none flex items-center gap-2"
                  >
                    {loading ? (
                      <>
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
                        Creating...
                      </>
                    ) : (
                      "Create Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* --- RIGHT: PREVIEW & CONTEXT (1 Col) --- */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live Preview Card */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 ">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">
                Live Preview
              </h4>

              <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-black shadow-sm">
                {/* Image Area */}
                <div className="h-48 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      className="h-full w-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <PhotoIcon className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                  )}
                </div>

                {/* Content Area */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                      {selectedCategory?.name || "Category"}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {productData.product_code || "CODE"}
                    </span>
                  </div>

                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1 line-clamp-2">
                    {productData.name || "Product Name"}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 h-8">
                    {productData.description ||
                      "Product description will appear here..."}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase">
                        Price
                      </p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        ₹{productData.price ? Number(productData.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 uppercase">
                        Stock
                      </p>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {productData.stock || "0"} units
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <DocumentTextIcon className="h-4 w-4 text-zinc-500" />
                <span className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">
                  Quick Tips
                </span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li>• Use a unique product code for better tracking.</li>
                <li>• Images should be at least 800x800px.</li>
                <li>• Ensure stock count reflects physical inventory.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
