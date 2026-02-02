import React, { useState, useEffect } from "react";
import Select, { type StylesConfig } from "react-select";
import toast from "react-hot-toast";
import { domainUrl, logOutHandler } from "../utils/constants";
import axios from "axios";
import { useNavigate } from "react-router";

// --- Heroicons ---
import {
  ArrowLeftIcon,
  PhotoIcon,
  ArrowPathIcon,
  XCircleIcon,
  CloudArrowUpIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type CategoryImage = {
  id: number;
  url: string;
  type: string;
};

type Category = {
  category_code: string;
  category_id: number;
  description: string;
  images: CategoryImage[];
  is_active: boolean;
  name: string;
};

// --- Custom Styles for React Select to match Zinc Theme ---
const customSelectStyles = (isDarkMode: boolean): StylesConfig => ({
  control: (provided, state) => ({
    ...provided,
    backgroundColor: isDarkMode ? "#18181b" : "#fff", // zinc-900 or white
    borderColor: isDarkMode ? "#27272a" : "#e4e4e7", // zinc-800 or zinc-200
    color: isDarkMode ? "#fff" : "#18181b",
    padding: "0.2rem",
    borderRadius: "0.5rem",
    boxShadow: state.isFocused ? (isDarkMode ? "0 0 0 2px #fff" : "0 0 0 2px #000") : "none",
    "&:hover": {
      borderColor: isDarkMode ? "#3f3f46" : "#a1a1aa",
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: isDarkMode ? "#18181b" : "#fff",
    border: `1px solid ${isDarkMode ? "#27272a" : "#e4e4e7"}`,
    borderRadius: "0.5rem",
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
    ":active": {
      backgroundColor: isDarkMode ? "#3f3f46" : "#e4e4e7",
    },
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

const UpdateCategory: React.FC = () => {
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  // Theme detection for React Select
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(
        document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark"
      );
    }
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState<any>(null);

  const [formData, setFormData] = useState({
    category_code: "",
    name: "",
    description: "",
    is_active: true,
  });

  const [initialFormData, setInitialFormData] = useState({
    category_code: "",
    name: "",
    description: "",
    is_active: true,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setFetching(true);
      try {
        const resp = await axios.get(`${domainUrl}products/categories/`, {
          params: { page: 1, page_size: 100000 },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        });
        const data = resp.data;
        const categoriesList: Category[] = Array.isArray(data)
          ? data
          : data.results || [];
        setCategories(categoriesList);
      } catch (err: any) {
        if (err.response?.data.code === "token_not_valid") {
          logOutHandler();
          navigate("/login");
          toast.error("Session expired.", { duration: 3000 });
          return;
        }
        setError("Failed to load categories.");
      } finally {
        setFetching(false);
      }
    };
    fetchCategories();
  }, [refetching]);

  const handleCategorySelect = (option: any) => {
    if (!option) {
        setSelectedCategoryOption(null);
        setSelectedCategory(null);
        return;
    }
    setSelectedCategoryOption(option);
    const category = categories.find((cat) => cat.category_id === option.value);
    if (category) {
      setSelectedCategory(category);
      setFormData({
        category_code: category.category_code,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
      });
      setInitialFormData({
        category_code: category.category_code,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
      });
      setSelectedImage(null);
      setError("");
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setError("");
    setFormData({ ...formData, [field]: value });
  };

  // --- Image Handling ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.size >2048576) {
            setError("Image size must be less than 1MB.");
            return;
        }
        setSelectedImage(file);
    }
  };

  const uploadImage = async (categoryId: number) => {
    setError("");
    if (!selectedImage) return;

    try {
      // Check if category already has an image
      const existingImage = selectedCategory?.images?.find(
        (img) => img.type === "normal"
      );

      if (existingImage) {

        console.log('inside existingggg');
        
        // UPDATE existing image - use "image" field
        const formDataImg = new FormData();
        formDataImg.append("category_id", categoryId.toString());
        formDataImg.append("image", selectedImage); // PUT expects "image"

        const imageResp = await axios.put(
          `${domainUrl}products/uploads/${existingImage.id}/`,
          formDataImg,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        if (imageResp.status === 200) {
          toast.success("Image updated.");
        }
      } else {

        console.log('inside neww');

        // CREATE new image - use "normal_image" field
        const formDataImg = new FormData();
        formDataImg.append("category_id", categoryId.toString());
        formDataImg.append("normal_image", selectedImage); // POST expects "normal_image"

        const imageResp = await axios.post(
          `${domainUrl}products/uploads/`,
          formDataImg,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        if (imageResp.status === 201) {
          toast.success("Image added.");
        }
      }
    } catch (err: any) {
      setError("Image upload failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedCategory) {
      setError("Select a category to update.");
      return;
    }

    const productUpdated =
      formData.category_code !== initialFormData.category_code ||
      formData.name !== initialFormData.name ||
      formData.description !== initialFormData.description ||
      formData.is_active !== initialFormData.is_active;
    const imageUpdated = !!selectedImage;

    if (!productUpdated && !imageUpdated) {
      setError("No changes detected.");
      return;
    }

    setLoading(true);
    try {
      if (productUpdated) {
        const resp = await axios.put(
          `${domainUrl}products/categories/${selectedCategory.category_id}/`,
          formData,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );

        if (resp.status !== 200 && resp.status !== 204) {
          throw new Error("Update failed.");
        }
      }

      if (imageUpdated) {
        await uploadImage(selectedCategory.category_id);
      }

      toast.success("Category updated successfully.");
      setRefetching((prev) => !prev);
      setSelectedImage(null);
      // We don't clear the form immediately so the user can see the result, 
      // but update initial data to new state
      setInitialFormData({ ...formData });
      
    } catch (err: any) {
      if (err.response?.data.code === "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired.", { position: "top-right" });
        return;
      }
      setError("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...initialFormData });
    setSelectedImage(null);
    setError("");
  };

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.category_id,
  }));

  const isFormChanged =
    selectedCategory &&
    (formData.category_code !== initialFormData.category_code ||
      formData.name !== initialFormData.name ||
      formData.description !== initialFormData.description ||
      formData.is_active !== initialFormData.is_active ||
      !!selectedImage);

  // --- Reusable Input ---
  const InputField = ({ label, id, value, onChange, placeholder, disabled }: any) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400 disabled:opacity-50"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full text-zinc-400 hover:text-black hover:bg-zinc-200 dark:hover:text-white dark:hover:bg-zinc-800 transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Edit Category
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Search for a category to modify its details.
            </p>
          </div>
        </div>

        {/* --- Selection Card --- */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 mb-6">
             <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Find Category
              </label>
             <Select
                options={categoryOptions}
                value={selectedCategoryOption}
                onChange={handleCategorySelect}
                isSearchable
                placeholder="Search by name..."
                isDisabled={loading || fetching}
                styles={customSelectStyles(isDarkMode)}
                isLoading={fetching}
              />
        </div>

        {/* --- Edit Form Card (Visible on Selection) --- */}
        {selectedCategory && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-fade-in-up">
                
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Category Information</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">ID: {selectedCategory.category_id}</p>
                    </div>
                    {/* Status Toggle */}
                    <button
                        type="button"
                        onClick={() => handleInputChange("is_active", !formData.is_active)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.is_active ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}
                    >
                        <span className="sr-only">Use setting</span>
                        <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formData.is_active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                        />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Category Code"
                            id="code"
                            value={formData.category_code}
                            onChange={(e: any) => handleInputChange("category_code", e.target.value)}
                            disabled={loading}
                        />
                         <InputField
                            label="Category Name"
                            id="name"
                            value={formData.name}
                            onChange={(e: any) => handleInputChange("name", e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            rows={3}
                            disabled={loading}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400 resize-none disabled:opacity-50"
                        />
                    </div>

                    {/* Image Section */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Category Image
                        </label>
                        
                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Current/Preview Image */}
                            <div className="shrink-0">
                                <div className="h-32 w-32 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center overflow-hidden relative group">
                                    {(selectedImage || (selectedCategory.images && selectedCategory.images.length > 0)) ? (
                                        <img
                                            src={selectedImage ? URL.createObjectURL(selectedImage) : selectedCategory.images[0].url}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <PhotoIcon className="h-10 w-10 text-zinc-300" />
                                    )}
                                    {/* Overlay for indication */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-bold">Current</span>
                                    </div>
                                </div>
                            </div>

                            {/* Upload Zone */}
                            <div className="flex-1">
                                <div
                                    className={`relative h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                                    dragActive
                                        ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900"
                                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        id="image-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if(file.size > 1024 * 1024) { setError("Max 1MB allowed"); return; }
                                                setSelectedImage(file);
                                            }
                                        }}
                                        disabled={loading}
                                    />
                                    
                                    {!selectedImage ? (
                                        <div className="pointer-events-none p-4">
                                            <CloudArrowUpIcon className="h-6 w-6 text-zinc-400 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                <span className="text-black dark:text-white font-bold underline cursor-pointer pointer-events-auto" onClick={() => document.getElementById('image-upload')?.click()}>Click to upload</span>
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-1">or drag and drop (Max 1MB)</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 pointer-events-auto">
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[150px]">{selectedImage.name}</p>
                                                <p className="text-xs text-zinc-500">{(selectedImage.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={(e) => { e.preventDefault(); setSelectedImage(null); }}
                                                className="p-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                 {/* Error Message */}
                {error && (
                    <div className="px-6 pb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                            <XCircleIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={!isFormChanged || loading}
                        className="px-5 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 disabled:opacity-50"
                    >
                        Reset Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormChanged || loading}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-zinc-200 dark:shadow-none flex items-center gap-2"
                    >
                         {loading ? (
                            <span className="flex items-center gap-2">
                                <ArrowPathIcon className="animate-spin h-4 w-4" />
                                Saving...
                            </span>
                        ) : (
                            <>
                                <PencilSquareIcon className="h-4 w-4 stroke-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default UpdateCategory;