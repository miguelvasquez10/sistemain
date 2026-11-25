import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Principal from "./pages/Principal";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Informacion from "./pages/Informacion";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDashboardPage from "./pages/ProjectDashboardPage";
import ProjectServicesPage from "./pages/ProjectServicesPage";
import CreateFormPage from "./pages/admin/CreateFormPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/principal" element={<Principal />} />
        <Route path="/informacion" element={<Informacion />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDashboardPage />} />
        <Route path="/projects/:projectId/services" element={<ProjectServicesPage />} />
        <Route path="/admin/create-form" element={<CreateFormPage />} />
      </Route>
    </Routes>
  );
}

export default App;
