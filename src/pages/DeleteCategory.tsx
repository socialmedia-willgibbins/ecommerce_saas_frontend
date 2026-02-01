import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { domainUrl, logOutHandler } from "../utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

interface ProductImage {
  id: number;
  url: string;
  type: string;
}

interface Category {
  category_id: number;
  name: string;
  description: string;
  category_code: string;
  is_active: boolean;
  images: ProductImage[];
}

const DeleteCategory: React.FC = () => {
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${domainUrl}products/categories/`, {
        params: {
          // is_active: true,
          page: 1,
          page_size: 100000,
        },
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const data = resp.data;
      const categoryData = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setCategories(categoryData);
    } catch (err: any) {
      if (err.response?.data.code == "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
          duration: 3000,
        });
        return;
      }
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category.");
      return;
    }

    setDeleting(true);
    try {
      const resp = await axios.delete(
        `${domainUrl}products/categories/${selectedCategory.category_id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (resp.status === 204 || resp.status === 200) {
        toast.success("Category deleted successfully.");
        fetchCategories();
        setSelectedCategory(null);
      } else {
        toast.error("Failed to delete category.");
      }
    } catch (err: any) {
      if (err.response?.data.code == "token_not_valid") {
        logOutHandler();
        navigate("/login");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
          duration: 3000,
        });
        return;
      }
      toast.error("Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-red-600">
          Delete Category
        </h1>

        <div className="mb-6 w-full">
          <Select
            isLoading={loading}
            isClearable
            placeholder={loading ? "Loading..." : "Select Category"}
            options={categories.map((cat) => ({
              value: cat.category_id,
              label: cat.name,
              category: cat,
            }))}
            value={
              selectedCategory
                ? {
                    value: selectedCategory.category_id,
                    label: selectedCategory.name,
                    category: selectedCategory,
                  }
                : null
            }
            onChange={(option) =>
              setSelectedCategory(option ? option.category : null)
            }
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#f87171",
                boxShadow: "none",
                "&:hover": { borderColor: "#ef4444" },
                minHeight: "48px",
              }),
            }}
          />
        </div>

        {/* Category Preview Card */}
        {selectedCategory && (
          <div className="mb-6 p-4 rounded-lg shadow bg-red-50 border border-red-200">
            <div className="flex flex-col items-center">
              {selectedCategory.images &&
                selectedCategory.images.length > 0 && (
                  <img
                    src={selectedCategory.images[0].url}
                    alt={selectedCategory.name}
                    className="w-32 h-32 object-contain rounded mb-3 border border-red-200 bg-white"
                  />
                )}
              <h2 className="text-xl font-semibold text-red-700 mb-1">
                {selectedCategory.name}
              </h2>
              <p className="text-gray-600 mb-1">
                {selectedCategory.description}
              </p>
              <div className="text-sm text-gray-700 mb-1">
                <b>Code:</b> {selectedCategory.category_code}
              </div>
              <div className="text-xs text-gray-500">
                <b>Status:</b>{" "}
                {selectedCategory.is_active ? "Active" : "Inactive"}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={deleting || !selectedCategory}
          className={`w-full py-3 text-lg font-semibold rounded-lg transition ${
            deleting || !selectedCategory
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
          }`}
        >
          {deleting ? "Deleting..." : "Delete Category"}
        </button>
      </div>
    </div>
  );
};

export default DeleteCategory;
