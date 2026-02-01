import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-hot-toast";
import { domainUrl, logOutHandler } from "../utils/constants";
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

interface Product {
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
  images: ProductImage[];
}

const DeleteProduct: React.FC = () => {
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${domainUrl}products/productdetail/`, {
        params: {
          // is_active: true,
          page: 1,
          page_size: 100000,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (resp.data && resp.data.results) {
        setProductList(resp.data.results);
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
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    setSubmitLoading(true);
    try {
      const resp = await axios.delete(
        `${domainUrl}products/productdetail/${selectedProduct.product_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      if (resp.status === 204 || resp.status === 200) {
        toast.success("Product deleted successfully");
        fetchProducts();
        setSelectedProduct(null);
      } else {
        toast.error("Failed to delete product");
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
      toast.error("Error deleting product");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-red-600">
          Delete Product
        </h1>

        <div className="mb-6 w-full">
          <Select
            isLoading={loading}
            isClearable
            placeholder={loading ? "Loading..." : "Select Product"}
            options={productList.map((product) => ({
              value: product.product_id,
              label: product.name,
              product,
            }))}
            value={
              selectedProduct
                ? {
                    value: selectedProduct.product_id,
                    label: selectedProduct.name,
                    product: selectedProduct,
                  }
                : null
            }
            onChange={(option) =>
              setSelectedProduct(option ? option.product : null)
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

        {/* Product Details Card */}
        {selectedProduct && (
          <div className="mb-6 p-4 rounded-lg shadow bg-purple-50 border border-purple-200">
            <div className="flex flex-col items-center">
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <img
                  src={selectedProduct.images[0].url}
                  alt={selectedProduct.name}
                  className="w-32 h-32 object-contain rounded mb-3 border border-purple-200 bg-white"
                />
              )}
              <h2 className="text-xl font-semibold text-purple-800 mb-1">
                {selectedProduct.name}
              </h2>
              <p className="text-gray-600 mb-1">
                {selectedProduct.description}
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-700 mb-1">
                <span>
                  <b>Code:</b> {selectedProduct.product_code}
                </span>
                <span>
                  <b>Price:</b> ₹{selectedProduct.price}
                </span>
                <span>
                  <b>Offer:</b> ₹{selectedProduct.offer_price}
                </span>
                <span>
                  <b>Discount:</b> {selectedProduct.discount_percentage}%
                </span>
                <span>
                  <b>Stock:</b> {selectedProduct.stock}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                <b>Category:</b> {selectedProduct.category?.name}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={submitLoading || !selectedProduct}
          className={`w-full py-3 text-lg font-semibold rounded-lg transition ${
            submitLoading || !selectedProduct
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
          }`}
        >
          {submitLoading ? "Deleting..." : "Delete Product"}
        </button>
      </div>
    </div>
  );
};

export default DeleteProduct;
