import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Toast from "./components/Toast";

import LoginPage      from "./pages/LoginPage";
import DashboardPage  from "./pages/DashboardPage";
import PoliciesPage   from "./pages/PoliciesPage";
import ClaimsPage     from "./pages/ClaimsPage";
import PremiumsPage   from "./pages/PremiumsPage";
import MembersPage    from "./pages/MembersPage";
import HospitalsPage  from "./pages/HospitalsPage";
import BranchesPage   from "./pages/BranchesPage";
import AuditPage      from "./pages/AuditPage";
import UsersPage      from "./pages/UsersPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
    <Route path="/policies" element={<ProtectedRoute><Layout><PoliciesPage /></Layout></ProtectedRoute>} />
    <Route path="/claims" element={<ProtectedRoute><Layout><ClaimsPage /></Layout></ProtectedRoute>} />
    <Route path="/premiums" element={<ProtectedRoute roles={["System Admin","HR/CEO","Claims Officer"]}><Layout><PremiumsPage /></Layout></ProtectedRoute>} />
    <Route path="/members" element={<ProtectedRoute><Layout><MembersPage /></Layout></ProtectedRoute>} />
    <Route path="/hospitals" element={<ProtectedRoute><Layout><HospitalsPage /></Layout></ProtectedRoute>} />
    <Route path="/branches" element={<ProtectedRoute roles={["System Admin","HR/CEO"]}><Layout><BranchesPage /></Layout></ProtectedRoute>} />
    <Route path="/audit" element={<ProtectedRoute roles={["System Admin","HR/CEO"]}><Layout><AuditPage /></Layout></ProtectedRoute>} />
    <Route path="/users" element={<ProtectedRoute roles={["System Admin"]}><Layout><UsersPage /></Layout></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
          <Toast />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
