import { useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { domainUrl } from "../constants";

interface RequireAuthProps {
  children: any;
  path: string;
}

const RequireAuth = ({ children, path }: RequireAuthProps) => {
  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");
  const role = localStorage.getItem("role");

  const RouteMap: { [key: string]: string[] } = {
    admin: [
      "/dashboard",
      "/admin-home",
      "/add-user",
      "/list-user",
      "/add-category",
      "/list-category",
      "/update-category",
      "/delete-category",
      "/add-product",
      "/update-product",
      "/list-product",
      "/delete-product",
      "/list-orders",
      "/settlement-history",
      "/bank-details",
    ],
  };

  const navigate = useNavigate();

  const handleRefreshToken = async () => {
    try {
      if (!refresh_token) return;
      const response = await axios.post(`${domainUrl}users/token/refresh/`, {
        refresh: refresh_token,
      });
      if (response.data?.access) {
        localStorage.setItem("access_token", response.data.access);
      }
    } catch (error) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    const lastLogin = localStorage.getItem("last_login");
    const now = Date.now();

    if (!lastLogin) {
      localStorage.setItem("last_login", now.toString());
    }

    // Auto-refresh access token every 10 minutes (600,000 ms)
    const accessTokenInterval = setInterval(() => {
      handleRefreshToken();
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(accessTokenInterval);
    };
  }, [navigate]);

  if (role) {
    const normalizedRole = role.replace("-", "");
    if (RouteMap[normalizedRole]?.includes(path)) {
      if (access_token === undefined || access_token === null) {
        return <Navigate replace to="/login" />;
      }

      return <>{children}</>;
    } else {
      return <Navigate replace to={"/forbidden"} />;
    }
  }
  return <Navigate to={"/"} />;
};

export default RequireAuth;
