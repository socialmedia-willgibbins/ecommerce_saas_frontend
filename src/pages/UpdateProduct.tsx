import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { domainUrl, logOutHandler } from "../utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

type Category = {
  category_code: string;
  name: string;
  description: string;
};

type ProductData = {
  category: Category;
  product_code: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  discount_percentage?: string;
  product_id?: number;
};

type ImageData = {
  id: number;
  product: number;
  image: string;
};

const UpdateProduct: React.FC = () => {
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const [productList, setProductList] = useState<ProductData[]>([]);
  const [imageList, setImageList] = useState<ImageData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null,
  );
  const [selectedProductOption, setSelectedProductOption] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [filteredImage, setFilteredImage] = useState<ImageData | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialFormData, setInitialFormData] = useState<ProductData | null>(
    null,
  );

  // For form fields
  const [formData, setFormData] = useState<ProductData | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchImages();
  }, []);

  const fetchProducts = async () => {
    try {
      const resp = await axios.get(
        `${domainUrl}products/productdetail/?page_size=100000`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      setProductList(resp.data.results || []);
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
      setError("Failed to fetch products.");
    }
  };

  const fetchImages = async () => {
    try {
      const resp = await axios.get(
        `${domainUrl}products/uploads/?page_size=100000`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      setImageList(resp.data.results || []);
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
      setError("Failed to fetch images.");
    }
  };

  useEffect(() => {
    if (selectedProduct && selectedProduct.product_id) {
      const filtered = imageList.filter(
        (img) => img.product === selectedProduct.product_id,
      );
      setFilteredImage(filtered.length ? filtered[filtered.length - 1] : null);
    } else {
      setFilteredImage(null);
    }
  }, [selectedProduct, imageList]);

  // Sync formData with selectedProduct
  useEffect(() => {
    setFormData(selectedProduct ? { ...selectedProduct } : null);
  }, [selectedProduct]);

  const handleProductSelect = (option: any) => {
    setSelectedProductOption(option);
    setSelectedProduct(option.value);
    setInitialFormData(option.value); // Save initial state for change detection
    setSelectedImage(null);
    setError("");
  };

  const handleInputChange = (field: string, value: string) => {
    setError("");

    if (!formData) return;
    setFormData((prev) => {
      if (!prev) return prev;
      if (field.startsWith("category.")) {
        const subField = field.split(".")[1];
        return {
          ...prev,
          category: { ...prev.category, [subField]: value },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 1048576) {
        setError("Image must be less than 1MB.");
        return;
      }
      setSelectedImage(file);
      setError("");
    }
  };

  const uploadImage = async (productId: number) => {
    if (!selectedImage) return;

    const filtered = imageList.filter((img) => img.product === productId);

    try {
      if (filtered.length > 0) {
        // Update existing image - use 'image' field for PUT
        const id = filtered[filtered.length - 1].id;
        const formDataImg = new FormData();
        formDataImg.append("product", String(productId));
        formDataImg.append("image", selectedImage);

        await axios.put(`${domainUrl}products/uploads/${id}/`, formDataImg, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${access_token}`,
          },
        });
      } else {
        // Create new image - use 'normal_image' field for POST
        const formDataImg = new FormData();
        formDataImg.append("product", String(productId));
        formDataImg.append("normal_image", selectedImage);

        await axios.post(`${domainUrl}products/uploads/`, formDataImg, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${access_token}`,
          },
        });
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
      setError("Image upload failed.");
    }
  };

  // isFormChanged as a value, not a function
  const isFormChanged =
    !!formData &&
    !!initialFormData &&
    (formData.product_code !== initialFormData.product_code ||
      formData.name !== initialFormData.name ||
      formData.description !== initialFormData.description ||
      formData.price !== initialFormData.price ||
      formData.stock !== initialFormData.stock ||
      formData.discount_percentage !== initialFormData.discount_percentage ||
      formData.category.category_code !==
        initialFormData.category.category_code ||
      formData.category.name !== initialFormData.category.name ||
      formData.category.description !== initialFormData.category.description ||
      !!selectedImage);

  // Reset only form fields and image, keep dropdown selection
  const handleReset = () => {
    if (selectedProductOption) {
      setSelectedProduct(selectedProductOption.value);
      setInitialFormData(selectedProductOption.value);
      setFormData(selectedProductOption.value);
      // Restore the initial image for the selected product
      const productId = selectedProductOption.value.product_id;
      const filtered = imageList.filter((img) => img.product === productId);
      setFilteredImage(filtered.length ? filtered[filtered.length - 1] : null);
    }
    setSelectedImage(null);
    setError("");
  };

  // Close everything, including dropdown
  const handleClose = () => {
    setSelectedProduct(null);
    setSelectedProductOption(null);
    setSelectedImage(null);
    setFilteredImage(null);
    setInitialFormData(null);
    setFormData(null);
    setError("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData || !formData.product_id) {
      setError("Please select a product.");
      return;
    }

    if (!isFormChanged) {
      setError("Please make any changes to update the product.");
      return;
    }

    setSubmitLoading(true);
    try {
      // Only update product if product fields changed
      const productFieldsChanged =
        formData.product_code !== initialFormData?.product_code ||
        formData.name !== initialFormData?.name ||
        formData.description !== initialFormData?.description ||
        formData.price !== initialFormData?.price ||
        formData.stock !== initialFormData?.stock ||
        formData.category.category_code !==
          initialFormData?.category.category_code ||
        formData.category.name !== initialFormData?.category.name ||
        formData.category.description !== initialFormData?.category.description;

      if (productFieldsChanged) {
        // Validate category has all required fields
        if (
          !formData.category?.category_code ||
          !formData.category?.name ||
          !formData.category?.description
        ) {
          setError(
            "Category information is incomplete. Please fill all category fields.",
          );
          setSubmitLoading(false);
          return;
        }

        const body = {
          category: {
            category_code: formData.category.category_code,
            name: formData.category.name,
            description: formData.category.description,
          },
          product_code: formData.product_code,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: Number(formData.stock),
          discount_percentage: formData.discount_percentage ? Number(formData.discount_percentage) : 0,
        };

        const resp = await axios.put(
          `${domainUrl}products/productdetail/${formData.product_id}/`,
          body,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access_token}`,
            },
          },
        );

        if (resp.status !== 200 && resp.status !== 204) {
          throw new Error("Update failed.");
        }
      }

      if (selectedImage) {
        await uploadImage(formData.product_id!);
      }

      setSelectedProduct(null);
      setSelectedProductOption(null);
      setSelectedImage(null);
      setFilteredImage(null);
      setInitialFormData(null);
      setFormData(null);
      setSubmitLoading(false);
      fetchProducts();
      fetchImages();
      alert("Product updated successfully!");
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
      setSubmitLoading(false);
      if (err.response && err.response.data && err.response.data.product_code) {
        setError(err.response.data.product_code);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  const productOptions = productList.map((product) => ({
    label: product.name,
    value: product,
  }));

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl bg-white border rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          Update Product
        </h2>
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Product
            </label>
            <Select
              options={productOptions}
              value={selectedProductOption}
              onChange={handleProductSelect}
              isSearchable
              placeholder="Select Product"
              className="react-select-container"
              classNamePrefix="react-select"
              isDisabled={submitLoading}
            />
          </div>
          {formData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Category Code
                  </label>
                  <input
                    type="text"
                    value={formData.category?.category_code || ""}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.category?.name || ""}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Category Description
                </label>
                <input
                  type="text"
                  value={formData.category?.description || ""}
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                  disabled
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Product Code
                  </label>
                  <input
                    type="text"
                    value={formData.product_code}
                    onChange={(e) =>
                      handleInputChange("product_code", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    disabled={submitLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    disabled={submitLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Product Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  rows={2}
                  disabled={submitLoading}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Price
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    disabled={submitLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    disabled={submitLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Discount %
                  </label>
                  <input
                    type="number"
                    value={formData.discount_percentage || ""}
                    onChange={(e) => handleInputChange("discount_percentage", e.target.value)}
                    min="0"
                    max="100"
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    disabled={submitLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Product Image
                </label>
                <div className="flex items-center gap-4 mt-2">
                  {(selectedImage || filteredImage) && (
                    <img
                      src={
                        selectedImage
                          ? URL.createObjectURL(selectedImage)
                          : filteredImage?.image
                      }
                      alt="Product"
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="product-image-upload"
                      disabled={submitLoading}
                    />
                    <label htmlFor="product-image-upload">
                      <button
                        type="button"
                        className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600 mr-2"
                        disabled={submitLoading}
                        onClick={() => {
                          // trigger file input
                          const input = document.getElementById(
                            "product-image-upload",
                          );
                          if (input) input.click();
                        }}
                      >
                        {selectedImage ? "Change Image" : "Upload Image"}
                      </button>
                    </label>
                    {selectedImage && (
                      <button
                        type="button"
                        className="text-xs text-red-500 hover:underline mt-1"
                        onClick={() => setSelectedImage(null)}
                        disabled={submitLoading}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {selectedImage && (
                <div className="text-xs text-gray-500 mt-2">
                  Image will be updated on next submit.
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isFormChanged) {
                      handleReset();
                    } else {
                      handleClose();
                    }
                  }}
                  className="bg-gray-100 text-gray-700 py-1 px-4 rounded hover:bg-gray-200 text-sm"
                  disabled={submitLoading}
                >
                  {isFormChanged ? "Reset" : "Close"}
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !formData}
                  className="bg-indigo-600 text-white py-1 px-4 rounded hover:bg-indigo-700 text-sm"
                >
                  {submitLoading ? "Updating..." : "Update Product"}
                </button>
              </div>
            </>
          )}
          {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
