import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "DM Sans, sans-serif", color: "#64748b" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #e2e8f0", borderTop: "4px solid #0a3d62", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p>Loading Fortune Sacco...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
