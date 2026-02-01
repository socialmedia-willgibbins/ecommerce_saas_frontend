import PublicAuth from "./PublicAuth";
import RequireAuth from "./RequiredAuth";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../../pages/Login";
import ProfilePage from "../../pages/ProfilePage";
import AdminDashboard from "../../pages/Dashboards/AdminDashboard";
import NotFoundPage from "../../pages/NotFoundPage";
import type { JSX } from "react";
import ForgotPassword from "../../pages/ForgotPassword";
import AddUser from "../../pages/AddUser";
import ListUser from "../../pages/ListUser";
import AddCategory from "../../pages/AddCategory";
import ListCategory from "../../pages/ListCategory";
import UpdateCategory from "../../pages/UpdateCategory";
import DeleteCategory from "../../pages/DeleteCategory";
import AddProduct from "../../pages/AddProduct";
import UpdateProduct from "../../pages/UpdateProduct";
import ListProduct from "../../pages/ListProduct";
import DeleteProduct from "../../pages/DeleteProduct";
import ListAllOrders from "../../pages/ListAllOrders";
import AdminSettlementHistory from "../../pages/AdminSettlementHistory";
import AdminBankDetails from "../../pages/AdminBankDetails";
import Layout from "../../components/Layout";
import RootRedirect from "../../components/RootRedirect";

// Owner Pages
import OwnerLogin from "../../pages/owner/OwnerLogin";
import OwnerDashboard from "../../pages/owner/OwnerDashboard";
import OwnerPaymentHistory from "../../pages/owner/OwnerPaymentHistory";
import OwnerAdminList from "../../pages/owner/OwnerAdminList";
import OwnerBankVerification from "../../pages/owner/OwnerBankVerification";


const Router = () => {
  let pathElementMapping: Record<string, JSX.Element> = {
    "/dashboard": <AdminDashboard />,
    "/profile-page": <ProfilePage />,
    "/admin-home": <AdminDashboard />,
    "/add-user": <AddUser />,
    "/list-user": <ListUser />,
    "/add-category": <AddCategory />,
    "/list-category": <ListCategory />,
    "/update-category": <UpdateCategory />,
    "/delete-category": <DeleteCategory />,
    "/add-product": <AddProduct />,
    "/update-product": <UpdateProduct />,
    "/list-product": <ListProduct />,
    "/delete-product": <DeleteProduct />,
    "/list-orders": <ListAllOrders />,
    "/settlement-history": <AdminSettlementHistory />,
    "/bank-details": <AdminBankDetails />,
    
    
  };
  let TheRoute = [];
  let keys = Object.keys(pathElementMapping);
  for (let e of keys) {
    TheRoute.push({
      path: e,
      element: pathElementMapping[e],
    });
  }
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Root route - redirect based on authentication */}
          <Route path="/" element={<RootRedirect />} />
          
          <Route
            path="/login"
            element={
              <PublicAuth>
                <Login />
              </PublicAuth>
            }
          />
            <Route
            path="/forgot-password"
            element={
              <PublicAuth>
                <ForgotPassword />
              </PublicAuth>
            }
          />

          {/* Owner Routes - Public Login, Protected Dashboard */}
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/payment-history" element={<OwnerPaymentHistory />} />
          <Route path="/owner/admins" element={<OwnerAdminList />} />
          <Route path="/owner/bank-verification" element={<OwnerBankVerification />} />

          {TheRoute ? (
            <Route path="/" element={<Layout />}>
              {TheRoute.map(({ path, element }, key) => (
                <Route
                  path={path}
                  element={<RequireAuth path={path}>{element}</RequireAuth>}
                  key={key}
                />
              ))}
            </Route>
          ) : (
            <Navigate to="/login" replace />
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
