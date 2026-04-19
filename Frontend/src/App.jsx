import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import TopNavbar from "./components/TopNavbar";

// Pages
import Login from "./pages/Login";
import AdminPanel from "./pages/Admin/AdminPanel"; // Make sure this points to AdminPanel
import MakerDashboard from "./pages/Maker/Dashboard"; // Make sure this points to Dashboard
import IssueForm from "./pages/Maker/IssueForm";
import CheckerDashboard from "./pages/Checker/Dashboard"; // Make sure this points to Checker

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* The Navbar sits outside the routes so it stays at the top of every page */}
        <TopNavbar />

        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Maker Routes */}
          <Route element={<ProtectedRoute allowedRoles={["Maker"]} />}>
            <Route path="/maker/dashboard" element={<MakerDashboard />} />
            <Route path="/maker/add-issue" element={<IssueForm />} />
          </Route>

          {/* Checker Routes */}
          <Route element={<ProtectedRoute allowedRoles={["Checker"]} />}>
            <Route path="/checker/dashboard" element={<CheckerDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/admin/users" element={<AdminPanel />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<div>404 Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
