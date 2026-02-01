import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router";
import { domainUrl, logOutHandler } from "../utils/constants";

// --- Heroicons ---
import {
  TagIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface CategoryData {
  category_code: string;
  name: string;
  description: string;
}

const AddCategory: React.FC = () => {
  const navigate = useNavigate();
  const access_token = localStorage.getItem("access_token");

  const [categoryData, setCategoryData] = useState<CategoryData>({
    category_code: "",
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // --- Image Handling Logic ---
  const handleFileValidation = (file: File) => {
    if (file.size > 2048576) {
      // 1MB
      toast.error("Image size must be less than 1MB.", {
        position: "top-center",
      });
      return false;
    }
    // Optional: Add type validation if needed
    // if (!file.type.startsWith("image/")) { ... }
    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && handleFileValidation(file)) {
      setSelectedImage(file);
    }
  };

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
      if (handleFileValidation(file)) {
        setSelectedImage(file);
      }
    }
  };

  // --- API Logic ---
  const uploadImage = async (categoryId: string) => {
    if (!selectedImage) return;

    try {
      const formData:any = new FormData();
      // formData.append("normal_image", selectedImage); // Changed from "image" to "normal_image"
      formData.append("category_id", categoryId);

    formData.append("normal_image", selectedImage); // Changed from "image" to "normal_image"

      const response = await axios.post(
        `${domainUrl}products/uploads/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Category created successfully.", {
          position: "top-center",
        });
      }
    } catch (err: any) {
      if (err.response?.data.code === "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired.", { position: "top-right" });
      } else {
        toast.error("Image upload failed.", { position: "top-center" });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { category_code, name, description } = categoryData;

    if (!category_code || !name || !description) {
      toast.dismiss();
      toast.error("Please fill all fields.", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      const body = { category_code, name, description };
      const resp = await axios.post(`${domainUrl}products/categories/`, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      });

      const { category_id } = resp.data;

      if (selectedImage) {
        await uploadImage(category_id);
      } else {
        toast.success("Category created successfully.", {
          position: "top-center",
        });
      }

      setCategoryData({ category_code: "", name: "", description: "" });
      setSelectedImage(null);
    } catch (err: any) {
      if (err.response?.data.code === "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired.", { position: "top-right" });
      } else if (err.response?.data?.category_code) {
        toast.error(err.response.data.category_code, {
          position: "top-center",
        });
      } else if (err.response?.data?.error) {
        toast.error(err.response.data.error, { position: "top-center" });
      } else {
        toast.error("Something went wrong.", { position: "top-center" });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Reusable Input Component ---
  // const InputField = ({
  //   label,
  //   id,
  //   value,
  //   onChange,
  //   placeholder,
  //   type = "text",
  //   required = true,
  // }: any) => (
  //   <div className="space-y-1.5">
  //     <label
  //       htmlFor={id}
  //       className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
  //     >
  //       {label} {required && <span className="text-red-500">*</span>}
  //     </label>
  //     <input
  //       type={type}
  //       id={id}
  //       value={value}
  //       onChange={onChange}
  //       placeholder={placeholder}
  //       className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400"
  //       required={required}
  //     />
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-gray-50 rounded-2xl dark:bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Add New Category
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Create a product category to organize your inventory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section (2 Columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Category Details
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Fill in the information below to create a new category.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Code */}
                  {/* <InputField
                    label="Category Code"
                    id="category_code"
                    value={categoryData.category_code}
                    onChange={(e: any) => {
                      const val = e.target.value;
                      if (/^[a-zA-Z0-9]*$/.test(val)) {
                        setCategoryData({ ...categoryData, category_code: val });
                      }
                    }}
                    placeholder="e.g. ELEC-001"
                  /> */}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Category Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="category_code"
                      value={categoryData.category_code}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[a-zA-Z0-9]*$/.test(val)) {
                          setCategoryData({
                            ...categoryData,
                            category_code: val,
                          });
                        }
                      }}
                      placeholder="e.g. ELEC-001"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400"
                    />
                  </div>

                  {/* Category Name */}
                  {/* <InputField
                    label="Category Name"
                    id="name"
                    value={categoryData.name}
                    onChange={(e: any) =>
                      setCategoryData({ ...categoryData, name: e.target.value })
                    }
                    placeholder="e.g. Electronics"
                  /> */}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={categoryData.name}
                      onChange={(e) =>
                        setCategoryData({
                          ...categoryData,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Electronics"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400"
                    />
                  </div>

                  {/* Description (Full Width) */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={categoryData.description}
                      onChange={(e) =>
                        setCategoryData({
                          ...categoryData,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-400 resize-none"
                      rows={4}
                      placeholder="Describe what products belong to this category..."
                      // required
                    />
                  </div>

                  {/* Image Upload (Full Width) */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Category Image
                    </label>

                    {!selectedImage ? (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-8 transition-all text-center ${
                          dragActive
                            ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
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
                          id="image-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                            <CloudArrowUpIcon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
                          </div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">
                            <span
                              className="text-black dark:text-white font-bold underline cursor-pointer pointer-events-auto"
                              onClick={() =>
                                document.getElementById("image-upload")?.click()
                              }
                            >
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            SVG, PNG, JPG or GIF (max. 1MB)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                        <div className="flex items-center gap-4 p-3">
                          <img
                            src={URL.createObjectURL(selectedImage)}
                            alt="Preview"
                            className="h-16 w-16 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                              {selectedImage.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {(selectedImage.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Footer */}
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
                        Creating...
                      </span>
                    ) : (
                      <>
                        <TagIcon className="h-4 w-4 stroke-2" />
                        Create Category
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Context/Help Sidebar (1 Column) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Info Card */}
            {/* <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <InformationCircleIcon className="h-5 w-5 text-zinc-900 dark:text-white" />
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Best Practices
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Organizing products into clear categories helps customers find
                what they are looking for and improves inventory management.
              </p>
              <ul className="mt-4 space-y-3">
                <li className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Use unique, short codes (e.g., <strong>HM-01</strong> for
                    Home).
                  </span>
                </li>
                <li className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Upload high-quality, square images for best display results.
                  </span>
                </li>
                <li className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Keep descriptions concise but descriptive for SEO benefits.
                  </span>
                </li>
              </ul>
            </div> */}

            {/* Preview Card */}
            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 opacity-60 pointer-events-none">
              <h4 className="font-bold text-zinc-900 dark:text-white text-sm mb-3">
                Card Preview
              </h4>
              <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-3 ">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-zinc-100  dark:bg-zinc-800 rounded-md flex items-center justify-center">
                    {selectedImage ? (
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        className="h-full w-full object-cover rounded-md"
                        alt="Preview"
                      />
                    ) : (
                      <PhotoIcon className="h-6 w-6 text-zinc-300" />
                    )}
                  </div>
                  <div>
                    {/* <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5"></div> */}
                    <div className="text-[10px] font-bold uppercase bg-zinc-200 dark:bg-zinc-800 rounded 2 px-2 py-1">
                      {categoryData?.name || "Category Name"}
                    </div>
                    <div className="text-[7px] w-22 font-bold  uppercase bg-zinc-200 dark:bg-zinc-800 rounded 2 px-2 py-1 mt-1">
                      {categoryData?.category_code || "Category Code"}
                    </div>
                    {/* <div className="h-2 w-16 bg-zinc-100 dark:bg-zinc-900 rounded"></div> */}
                  </div>
                </div>
                <div className="text-[8px] h-20 font-bold  bg-zinc-200 dark:bg-zinc-800 rounded 2 px-2 py-1 mt-2 overflow-clip">
                  {categoryData?.description || "Category Description"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
