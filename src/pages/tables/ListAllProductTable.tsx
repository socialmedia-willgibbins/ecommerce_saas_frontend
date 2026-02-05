import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { domainUrl, logOutHandler } from "../../utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { Dialog, Transition } from "@headlessui/react";

// --- Heroicons ---
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  CubeIcon,
  TagIcon,
  FunnelIcon,
  ClockIcon,
  XCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

// --- Types ---
type Product = {
  product_id: number;
  product_code: string;
  name: string;
  description: string;
  price: string;
  discount_percentage: string;
  offer_price: number;
  stock: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  category: {
    category_id: number;
    name: string;
    description: string;
    category_code: string;
    is_active: boolean;
    images: { id: number; url: string; type: string }[];
  };
  images: { id: number; url: string; type: string }[];
};

type ProductApiResponse = {
  results: Product[];
  count: number;
};

// ==========================================
// --- REUSABLE INPUT FOR MODALS ---
// ==========================================
const ModalInput = ({
  label,
  id,
  value,
  onChange,
  type = "text",
  disabled = false,
  textarea = false,
  placeholder = "",
}: any) => (
  <div className="group space-y-2">
    <label
      htmlFor={id}
      className="block text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 group-focus-within:text-indigo-500 transition-colors"
    >
      {label}
    </label>
    {textarea ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={3}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-black transition-all resize-none disabled:opacity-50 placeholder:text-zinc-400"
      />
    ) : (
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-black transition-all disabled:opacity-50 placeholder:text-zinc-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    )}
  </div>
);

// ==========================================
// --- DELETE MODAL ---
// ==========================================
const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  productName,
}: any) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold text-zinc-900 dark:text-white"
                  >
                    Delete Product
                  </Dialog.Title>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Are you sure you want to delete{" "}
                    <span className="font-bold text-zinc-900 dark:text-white">
                      "{productName}"
                    </span>
                    ? This cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

// ==========================================
// --- EDIT PRODUCT MODAL ---
// ==========================================
// ==========================================
// --- BEAUTIFIED EDIT PRODUCT MODAL ---
// ==========================================
// ==========================================
// --- SPLIT-VIEW EDIT MODAL (Add Product Style) ---
// ==========================================
const EditProductModal = ({
  isOpen,
  onClose,
  product,
  onSave,
  loading,
}: any) => {
  // Theme Detection for styles
  const [, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(
        document.documentElement.classList.contains("dark") ||
          localStorage.getItem("theme") === "dark",
      );
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    product_code: "",
    description: "",
    price: "",
    stock: "",
    discount_percentage: "",
    category: {
      category_code: "",
      name: "",
      description: "",
    },
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  // Initialize data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        product_code: product.product_code,
        description: product.description,
        price: product.price,
        stock: product.stock.toString(),
        discount_percentage: product.discount_percentage?.toString() || "",
        category: {
          category_code: product.category?.category_code || "",
          name: product.category?.name || "",
          description: product.category?.description || "",
        },
      });
      const img =
        product.images.find((i: any) => i.type === "normal")?.url ||
        product.images[0]?.url ||
        "";
      setCurrentImageUrl(img);
      setSelectedImage(null);
    }
  }, [product, isOpen]);

  // --- Image Handlers (Drag & Drop) ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be < 2MB");
        return;
      }
      setSelectedImage(file);
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
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be < 2MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product.product_id, formData, selectedImage);
  };

  // Determine image for preview
  const displayImage = selectedImage
    ? URL.createObjectURL(selectedImage)
    : currentImageUrl;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div
          className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md"
          aria-hidden="true"
        />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-8"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-8"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight"
                    >
                      Edit Product
                    </Dialog.Title>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      Make changes to product details and inventory.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-zinc-100 dark:divide-zinc-800">
                  {/* --- LEFT COLUMN: FORM --- */}
                  <div className="lg:col-span-2 p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <form
                      id="edit-form"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      {/* Category (Read Only context) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                          Category
                        </label>
                        <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2 cursor-not-allowed">
                          <TagIcon className="h-4 w-4" />
                          {formData.category.name || "Uncategorized"}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModalInput
                          label="Product Code"
                          id="e-code"
                          value={formData.product_code}
                          onChange={(e: any) =>
                            setFormData({
                              ...formData,
                              product_code: e.target.value,
                            })
                          }
                          disabled={loading}
                          placeholder="e.g. PRD-001"
                        />
                        <ModalInput
                          label="Product Name"
                          id="e-name"
                          value={formData.name}
                          onChange={(e: any) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          disabled={loading}
                          placeholder="e.g. Wireless Headphones"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModalInput
                          label="Price"
                          id="e-price"
                          type="number"
                          value={formData.price}
                          onChange={(e: any) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          disabled={loading}
                          placeholder="0.00"
                        />
                        <ModalInput
                          label="Stock"
                          id="e-stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e: any) =>
                            setFormData({ ...formData, stock: e.target.value })
                          }
                          disabled={loading}
                          placeholder="0"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModalInput
                          label="Discount %"
                          id="e-discount"
                          type="number"
                          value={formData.discount_percentage || ""}
                          onChange={(e: any) =>
                            setFormData({ ...formData, discount_percentage: e.target.value })
                          }
                          disabled={loading}
                          placeholder="0"
                        />
                      </div>

                      <ModalInput
                        label="Description"
                        id="e-desc"
                        textarea
                        value={formData.description}
                        onChange={(e: any) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        disabled={loading}
                        placeholder="Product details..."
                      />

                      {/* Drag & Drop Image */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                          Product Image
                        </label>
                        <div
                          className={`relative h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                            dragActive
                              ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900"
                              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/50"
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onClick={() =>
                            document
                              .getElementById("modal-image-upload")
                              ?.click()
                          }
                        >
                          <input
                            type="file"
                            id="modal-image-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={loading}
                          />
                          <div className="p-3 rounded-full bg-white dark:bg-zinc-800 shadow-sm mb-2">
                            <CloudArrowUpIcon className="h-6 w-6 text-zinc-400" />
                          </div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">
                            {selectedImage
                              ? "File Selected"
                              : "Click to upload or drag and drop"}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {selectedImage
                              ? selectedImage.name
                              : "SVG, PNG, JPG (Max 2MB)"}
                          </p>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* --- RIGHT COLUMN: LIVE PREVIEW --- */}
                  <div className="lg:col-span-1 bg-zinc-50 dark:bg-zinc-900/50 p-8 flex flex-col gap-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Live Preview
                    </h4>

                    {/* Preview Card */}
                    <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                      {/* Preview Image Area */}
                      <div className="h-48 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden relative">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            className="h-full w-full object-cover"
                            alt="Preview"
                          />
                        ) : (
                          <PhotoIcon className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                        )}
                        {/* Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                            {formData.category.name || "Category"}
                          </span>
                        </div>
                      </div>

                      {/* Preview Content */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-zinc-900 dark:text-white text-lg line-clamp-1">
                            {formData.name || "Product Name"}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 h-8">
                          {formData.description ||
                            "Description will appear here..."}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          <div>
                            <p className="text-[10px] text-zinc-400 uppercase font-bold">
                              Price
                            </p>
                            <p className="text-xl font-bold text-zinc-900 dark:text-white">
                              {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                              }).format(Number(formData.price) || 0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-400 uppercase font-bold">
                              Stock
                            </p>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                Number(formData.stock) > 0
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {formData.stock || "0"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tips */}
                    {/* <div className="rounded-xl border border-blue-100 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/20 p-4">
                      <div className="flex gap-3">
                        <div className="shrink-0 text-blue-500">
                          <CloudArrowUpIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-blue-700 dark:text-blue-300">
                            Quick Tip
                          </h5>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Changes to the image are saved only when you click
                            "Save Changes".
                          </p>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <button
                    type="button"
                    className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    form="edit-form"
                    disabled={loading}
                    className="px-8 py-2.5 text-sm font-bold text-white bg-black dark:bg-white dark:text-black rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-zinc-200 dark:shadow-zinc-900 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
// ==========================================
// --- MAIN LIST COMPONENT ---
// ==========================================
export const ListAllProductTable = () => {
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ProductApiResponse>(
        `${domainUrl}products/productdetail/`,
        {
          params: {
            is_active: true,
            page: page + 1,
            page_size: rowsPerPage,
            search: search || undefined,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      setProducts(response.data.results);
      setTotalCount(response.data.count);
    } catch (err: any) {
      if (err.response?.data.code === "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired.");
        return;
      }
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, search]);

  // Handlers
  const handleRefresh = () => fetchProducts();
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

  // --- Modal Handlers ---
  const openEdit = (prod: Product) => {
    setSelectedProduct(prod);
    setIsEditOpen(true);
  };
  const openDelete = (prod: Product) => {
    setSelectedProduct(prod);
    setIsDeleteOpen(true);
  };

  const handleEditSave = async (
    id: number,
    data: any,
    imageFile: File | null,
  ) => {
    setActionLoading(true);
    try {
      // Validate discount percentage if provided
      if (data.discount_percentage) {
        const discount = Number(data.discount_percentage);
        if (isNaN(discount) || discount < 0.01 || discount > 99.9) {
          toast.error("Discount percentage must be between 0.01% and 99.9%");
          setActionLoading(false);
          return;
        }
      }

      // 1. Update Product Details
      // Remove category from payload if any field is empty
      const payload = { ...data };
      if (
        !payload.category?.category_code ||
        !payload.category?.name ||
        !payload.category?.description
      ) {
        delete payload.category;
      }

      await axios.put(`${domainUrl}products/productdetail/${id}/`, payload, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // 2. Upload Image if changed
      if (imageFile) {
        const product = products.find((p) => p.product_id === id);
        const hasExistingImage = product?.images && product.images.length > 0;

        if (hasExistingImage) {
          // Update existing image - use PUT with 'image' field
          const imageId = product!.images[0].id;
          const formData = new FormData();
          formData.append("image", imageFile);
          formData.append("product", id.toString());

          await axios.put(
            `${domainUrl}products/uploads/${imageId}/`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${access_token}`,
              },
            },
          );
        } else {
          // Create new image - use POST with 'normal_image' field
          const formData = new FormData();
          formData.append("normal_image", imageFile);
          formData.append("product", id.toString());

          await axios.post(`${domainUrl}products/uploads/`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${access_token}`,
            },
          });
        }
      }

      toast.success("Product updated successfully");
      setIsEditOpen(false);
      fetchProducts(); // Refresh list
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setActionLoading(true);
    try {
      await axios.delete(
        `${domainUrl}products/productdetail/${selectedProduct.product_id}/`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );
      toast.success("Product deleted");
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50 rounded-2xl dark:bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Products
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your inventory, prices, and stock levels.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/add-product")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-all shadow-lg shadow-zinc-200 dark:shadow-none"
            >
              <PlusIcon className="h-4 w-4 stroke-2" /> Add Product
            </button>
          </div>
        </div>

        {/* --- Toolbar --- */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6 p-4 flex flex-col lg:flex-row gap-4 justify-between">
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-lg relative group"
          >
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm text-zinc-900 dark:text-white transition-all placeholder:text-zinc-400"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={loading}
            />
          </form>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all">
              <FunnelIcon className="h-4 w-4" /> Filter
            </button>
            <button
              className="p-2.5 text-zinc-500 hover:text-black dark:hover:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors"
              onClick={handleRefresh}
              disabled={loading}
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* --- Error --- */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400">
            <XCircleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* --- Table --- */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  {[
                    { label: "Product", w: "w-[30%]" },
                    { label: "Category", w: "w-[15%]" },
                    { label: "Price Info", w: "w-[15%]" },
                    { label: "Stock", w: "w-[10%]" },
                    { label: "Last Updated", w: "w-[15%]" },
                    { label: "Actions", w: "w-[15%] text-right" },
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ${h.w}`}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <ArrowPathIcon className="h-8 w-8 mx-auto text-zinc-300 animate-spin" />
                      <p className="mt-2 text-sm text-zinc-500">
                        Loading products...
                      </p>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <CubeIcon className="h-12 w-12 mx-auto text-zinc-400" />
                      <p className="text-sm font-medium text-zinc-900 dark:text-white mt-2">
                        No products found
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((row) => (
                    <tr
                      key={row.product_id}
                      className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 shrink-0 rounded-lg flex items-center justify-center overflow-hidden ">
                            {row.images[0]?.url ? (
                              <img
                                src={row.images[0].url}
                                alt={row.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <PhotoIcon className="h-6 w-6 text-zinc-300" />
                            )}
                          </div>
                          <div className="ml-2">
                            <p className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                              {row.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {row.description}
                            </p>
                            <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                              {row.product_code}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {row.category ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                            <TagIcon className="h-3 w-3" />
                            {row.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">
                            Uncategorized
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">
                            {formatPrice(row.offer_price)}
                          </span>
                          {Number(row.discount_percentage) > 0 && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-zinc-400 line-through decoration-zinc-400">
                                {formatPrice(parseFloat(row.price))}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 rounded">
                                -
                                {parseFloat(row.discount_percentage).toFixed(0)}
                                %
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              row.stock > 10
                                ? "bg-emerald-500"
                                : row.stock > 0
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              row.stock === 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {row.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span>
                            {new Date(row.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 transition-opacity">
                          <button
                            className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            onClick={() => openEdit(row)}
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            onClick={() => openDelete(row)}
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                {[5, 10, 20, 50].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleChangePage(page - 1)}
                disabled={page === 0 || loading}
                className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-500 transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono text-zinc-900 dark:text-white px-2">
                Page {page + 1} of {totalPages || 1}
              </span>
              <button
                onClick={() => handleChangePage(page + 1)}
                disabled={page + 1 >= totalPages || loading}
                className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-500 transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* --- MODALS --- */}
        <EditProductModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          product={selectedProduct}
          onSave={handleEditSave}
          loading={actionLoading}
        />
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          loading={actionLoading}
          productName={selectedProduct?.name}
        />
      </div>
    </div>
  );
};
