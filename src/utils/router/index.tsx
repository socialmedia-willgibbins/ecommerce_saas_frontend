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
import Layout from "../../components/Layout";


const Router = () => {
  let pathElementMapping: Record<string, JSX.Element> = {
    "/dashboard": <Layout/>,
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
