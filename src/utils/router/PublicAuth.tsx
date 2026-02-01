import { Navigate } from "react-router-dom";

const PublicAuth = ({ children }: any) => {
  const access_token = localStorage.getItem("access_token");
  if (access_token && access_token.length > 10) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

export default PublicAuth;
