import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { domainUrl, logOutHandler } from "../../utils/constants";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Dialog, Transition } from "@headlessui/react"; // Ensure you have @headlessui/react installed

// --- Heroicons ---
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  TagIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// --- Types ---
type CategoryImage = {
  id: number;
  url: string;
  type: string;
};

type Category = {
  category_id: number;
  name: string;
  description: string;
  category_code: string;
  is_active: boolean;
  images: CategoryImage[];
};

type CategoryApiResponse = {
  results: Category[];
  count: number;
};

// --- Reusable Input Component for Modals ---
const ModalInput = ({
  label,
  id,
  value,
  onChange,
  type = "text",
  disabled = false,
  textarea = false,
}: any) => (
  <div className="space-y-1.5">
    <label
      htmlFor={id}
      className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
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
        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all resize-none disabled:opacity-50"
      />
    ) : (
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all disabled:opacity-50"
      />
    )}
  </div>
);

// ==========================================
// --- DELETE CONFIRMATION MODAL ---
// ==========================================
const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  categoryName,
}: any) => {
  return (
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-red-600 dark:text-red-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-zinc-900 dark:text-white"
                    >
                      Delete Category
                    </Dialog.Title>
                    <div className="mt-1">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Are you sure you want to delete{" "}
                        <span className="font-bold text-zinc-900 dark:text-white">
                          "{categoryName}"
                        </span>
                        ? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 transition-colors"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 items-center gap-2"
                    onClick={onConfirm}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete Category"}
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
// --- EDIT CATEGORY MODAL ---
// ==========================================
// ==========================================
// --- SPLIT-VIEW CATEGORY EDIT MODAL ---
// ==========================================
const EditModal = ({ isOpen, onClose, category, onSave, loading }: any) => {
  const [formData, setFormData] = useState({
    name: "",
    category_code: "",
    description: "",
    is_active: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedCarouselImage, setSelectedCarouselImage] =
    useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [currentCarouselImageUrl, setCurrentCarouselImageUrl] =
    useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [carouselDragActive, setCarouselDragActive] = useState(false);

  // Initialize form when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        category_code: category.category_code,
        description: category.description,
        is_active: category.is_active,
      });
      const img =
        category.images.find((i: any) => i.type === "normal")?.url ||
        category.images[0]?.url ||
        "";
      const carouselImg =
        category.images.find((i: any) => i.type === "carousel")?.url || "";
      setCurrentImageUrl(img);
      setCurrentCarouselImageUrl(carouselImg);
      setSelectedImage(null);
      setSelectedCarouselImage(null);
    }
  }, [category, isOpen]);

  // --- Image Handlers ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        toast.error("Image must be < 1MB");
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
      if (file.size > 1024 * 1024) {
        toast.error("Image must be < 1MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  // Carousel image handlers
  const handleCarouselImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        toast.error("Carousel image must be < 1MB");
        return;
      }
      setSelectedCarouselImage(file);
    }
  };

  const handleCarouselDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover")
      setCarouselDragActive(true);
    else if (e.type === "dragleave") setCarouselDragActive(false);
  };

  const handleCarouselDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCarouselDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 1024 * 1024) {
        toast.error("Carousel image must be < 1MB");
        return;
      }
      setSelectedCarouselImage(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      category.category_id,
      formData,
      selectedImage,
      selectedCarouselImage,
    );
  };

  // Determine which image to show in preview
  const displayImage = selectedImage
    ? URL.createObjectURL(selectedImage)
    : currentImageUrl;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
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
                {/* Header */}
                <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight"
                    >
                      Edit Category
                    </Dialog.Title>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      Modify category details, appearance, and status.
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
                      id="cat-edit-form"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModalInput
                          label="Category Code"
                          id="edit-code"
                          value={formData.category_code}
                          onChange={(e: any) =>
                            setFormData({
                              ...formData,
                              category_code: e.target.value,
                            })
                          }
                          disabled={loading}
                          placeholder="e.g. ELEC-001"
                        />
                        <ModalInput
                          label="Category Name"
                          id="edit-name"
                          value={formData.name}
                          onChange={(e: any) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          disabled={loading}
                          placeholder="e.g. Electronics"
                        />
                      </div>

                      <ModalInput
                        label="Description"
                        id="edit-desc"
                        value={formData.description}
                        onChange={(e: any) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        textarea
                        disabled={loading}
                        placeholder="Describe this category..."
                      />

                      {/* Status Toggle Card */}
                      <div
                        onClick={() =>
                          setFormData({
                            ...formData,
                            is_active: !formData.is_active,
                          })
                        }
                        className="cursor-pointer group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${formData.is_active ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"}`}
                          >
                            {formData.is_active ? (
                              <CheckCircleIcon className="h-5 w-5" />
                            ) : (
                              <XCircleIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold ${formData.is_active ? "text-emerald-900 dark:text-emerald-400" : "text-zinc-900 dark:text-zinc-300"}`}
                            >
                              {formData.is_active
                                ? "Active Status"
                                : "Inactive Status"}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {formData.is_active
                                ? "Visible to customers"
                                : "Hidden from store"}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.is_active ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is_active ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </div>
                      </div>

                      {/* Image Uploads Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category Image */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                            Category Image
                          </label>
                          <div
                            className={`relative h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
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
                                .getElementById("modal-cat-upload")
                                ?.click()
                            }
                          >
                            <input
                              type="file"
                              id="modal-cat-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageChange}
                              disabled={loading}
                            />
                            {selectedImage || currentImageUrl ? (
                              <div className="flex flex-col items-center gap-2 px-3">
                                <img
                                  src={
                                    selectedImage
                                      ? URL.createObjectURL(selectedImage)
                                      : currentImageUrl
                                  }
                                  alt="Category Preview"
                                  className="h-16 w-16 object-cover rounded-lg border border-zinc-300 dark:border-zinc-700"
                                />
                                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-full">
                                  {selectedImage
                                    ? selectedImage.name
                                    : "Current image"}
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm mb-1">
                                  <CloudArrowUpIcon className="h-5 w-5 text-zinc-400" />
                                </div>
                                <p className="text-xs font-medium text-zinc-900 dark:text-white px-2">
                                  Upload Image
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Carousel Image */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                            Carousel Image{" "}
                            <span className="text-xs text-zinc-400 font-normal">
                              (Optional)
                            </span>
                          </label>
                          <div
                            className={`relative h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                              carouselDragActive
                                ? "border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950"
                                : "border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50"
                            }`}
                            onDragEnter={handleCarouselDrag}
                            onDragLeave={handleCarouselDrag}
                            onDragOver={handleCarouselDrag}
                            onDrop={handleCarouselDrop}
                            onClick={() =>
                              document
                                .getElementById("modal-carousel-upload")
                                ?.click()
                            }
                          >
                            <input
                              type="file"
                              id="modal-carousel-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={handleCarouselImageChange}
                              disabled={loading}
                            />
                            {selectedCarouselImage ||
                            currentCarouselImageUrl ? (
                              <div className="flex flex-col items-center gap-2 px-3">
                                <img
                                  src={
                                    selectedCarouselImage
                                      ? URL.createObjectURL(
                                          selectedCarouselImage,
                                        )
                                      : currentCarouselImageUrl
                                  }
                                  alt="Carousel Preview"
                                  className="h-16 w-16 object-cover rounded-lg border-2 border-indigo-300 dark:border-indigo-700"
                                />
                                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 truncate max-w-full">
                                  {selectedCarouselImage
                                    ? selectedCarouselImage.name
                                    : "Current carousel"}
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm mb-1">
                                  <CloudArrowUpIcon className="h-5 w-5 text-indigo-400" />
                                </div>
                                <p className="text-xs font-medium text-zinc-900 dark:text-white px-2">
                                  Upload Carousel
                                </p>
                              </>
                            )}
                          </div>
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
                    <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden group">
                      {/* Image Area */}
                      <div className="h-40 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden relative">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt="Preview"
                          />
                        ) : (
                          <PhotoIcon className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                        )}
                        {/* Code Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                            {formData.category_code || "CODE"}
                          </span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-zinc-900 dark:text-white text-lg line-clamp-1">
                            {formData.name || "Category Name"}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-4 min-h-[3rem]">
                          {formData.description ||
                            "Description will appear here..."}
                        </p>

                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${formData.is_active ? "bg-emerald-500" : "bg-zinc-300"}`}
                          />
                          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            {formData.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tips */}
                    {/* <div className="rounded-xl border border-blue-100 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/20 p-4">
                            <div className="flex gap-3">
                                <div className="shrink-0 text-blue-500">
                                    <TagIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-blue-700 dark:text-blue-300">Organizing Tip</h5>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        Ensure category codes are unique and keep descriptions concise for better SEO.
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
                    form="cat-edit-form"
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
// --- MAIN TABLE COMPONENT ---
// ==========================================
export const ListAllCategoryTable = () => {
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  // --- State ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // For modal actions
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // --- Modal States ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<CategoryApiResponse>(
        `${domainUrl}products/categories/`,
        {
          params: {
            page: page + 1,
            page_size: rowsPerPage,
            search: search || undefined,
            // request only active categories from the API
            is_active: true,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      // Prefer server-filtered results but defensively ensure only active categories
      const filtered = response.data.results.filter((c) => c.is_active);
      setCategories(filtered);
      // Use filtered length so pagination reflects the active-only view
      setTotal(filtered.length);
    } catch (err: any) {
      if (err.response?.data.code === "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired.", { position: "top-right" });
        return;
      }
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, rowsPerPage, search]);

  // --- Handlers ---
  const handleRefresh = () => fetchCategories();
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

  // --- Edit Logic ---
  const openEditModal = (cat: Category) => {
    setSelectedCategory(cat);
    setIsEditOpen(true);
  };

  const handleEditSave = async (
    id: number,
    data: any,
    imageFile: File | null,
    carouselFile: File | null,
  ) => {
    setActionLoading(true);
    try {
      // 1. Update Details
      await axios.put(`${domainUrl}products/categories/${id}/`, data, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // 2. Upload Normal Image (if changed)
      if (imageFile) {
        const category = categories.find((c) => c.category_id === id);
        const normalImage = category?.images?.find((i) => i.type === "normal");

        if (normalImage) {
          // Update existing normal image - use PUT with 'image' field
          const formData = new FormData();
          formData.append("image", imageFile);
          formData.append("category", id.toString());

          await axios.put(
            `${domainUrl}products/uploads/${normalImage.id}/`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${access_token}`,
              },
            },
          );
        } else {
          // Create new normal image - use POST with 'normal_image' field
          const formData = new FormData();
          formData.append("normal_image", imageFile);
          formData.append("category", id.toString());

          await axios.post(`${domainUrl}products/uploads/`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${access_token}`,
            },
          });
        }
      }

      // 3. Upload Carousel Image (if changed)
      if (carouselFile) {
        const category = categories.find((c) => c.category_id === id);
        const carouselImage = category?.images?.find(
          (i) => i.type === "carousel",
        );

        if (carouselImage) {
          // Update existing carousel image - use PUT with 'image' field
          const formData = new FormData();
          formData.append("image", carouselFile);
          formData.append("category", id.toString());

          await axios.put(
            `${domainUrl}products/uploads/${carouselImage.id}/`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${access_token}`,
              },
            },
          );
        } else {
          // Create new carousel image - use POST with 'carousel_image' field
          const formData = new FormData();
          formData.append("carousel_image", carouselFile);
          formData.append("category", id.toString());

          await axios.post(`${domainUrl}products/uploads/`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${access_token}`,
            },
          });
        }
      }

      toast.success("Category updated successfully");
      setIsEditOpen(false);
      fetchCategories(); // Refresh list
    } catch (error) {
      toast.error("Failed to update category");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Delete Logic ---
  const openDeleteModal = (cat: Category) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    setActionLoading(true);
    try {
      await axios.delete(
        `${domainUrl}products/categories/${selectedCategory.category_id}/`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );
      toast.success("Category deleted");
      setIsDeleteOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / rowsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 rounded-2xl dark:bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Categories
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Organize and manage your product catalog structure.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/add-category")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-all shadow-lg shadow-zinc-200 dark:shadow-none"
            >
              <PlusIcon className="h-4 w-4 stroke-2" />
              Add Category
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
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-sm text-zinc-900 dark:text-white transition-all placeholder:text-zinc-400"
              placeholder="Search categories by name or code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={loading}
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-2.5 text-zinc-500 hover:text-black dark:hover:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors"
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh Data"
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
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
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  {[
                    { label: "Category Details", width: "w-1/3" },
                    { label: "Code", width: "w-32" },
                    { label: "Status", width: "w-24" },
                    { label: "Image", width: "w-24" },
                    { label: "Description", width: "w-auto" },
                    { label: "Actions", width: "w-24 text-right" },
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className={`px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ${header.width}`}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <ArrowPathIcon className="h-8 w-8 mx-auto text-zinc-300 animate-spin" />
                      <p className="mt-2 text-sm text-zinc-500">
                        Loading categories...
                      </p>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="h-12 w-12 mx-auto bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                        <TagIcon className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        No categories found
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Try adjusting your search terms.
                      </p>
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr
                      key={cat.category_id}
                      className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      {/* Name & ID */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">
                            {cat.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            ID: {cat.category_id}
                          </p>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                          {cat.category_code}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            cat.is_active
                              ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : "text-zinc-500 bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                          }`}
                        >
                          {cat.is_active ? (
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                          ) : (
                            <XCircleIcon className="h-3.5 w-3.5" />
                          )}
                          {cat.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Image */}
                      <td className="px-6 py-4">
                        <div className="h-14 w-14 rounded-lg  flex items-center justify-center overflow-hidden">
                          {cat.images.find((i) => i.type === "normal")?.url ||
                          cat.images[0]?.url ? (
                            <img
                              src={
                                cat.images.find((i) => i.type === "normal")
                                  ?.url || cat.images[0]?.url
                              }
                              alt={cat.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <PhotoIcon className="h-5 w-5 text-zinc-300" />
                          )}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                          {cat.description}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1  transition-opacity">
                          <button
                            className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit"
                            onClick={() => openEditModal(cat)}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Delete"
                            onClick={() => openDeleteModal(cat)}
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

          {/* --- Pagination Footer --- */}
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  disabled={loading}
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
        </div>

        {/* --- Modals --- */}
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          loading={actionLoading}
          categoryName={selectedCategory?.name}
        />

        <EditModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          category={selectedCategory}
          onSave={handleEditSave}
          loading={actionLoading}
        />
      </div>
    </div>
  );
};
