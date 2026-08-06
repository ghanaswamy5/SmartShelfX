import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './context/authStore';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import SalesPage from './pages/sales/SalesPage';
import InventoryPage from './pages/inventory/InventoryPage';
import AiPage from './pages/ai/AiPage';
import ReportsPage from './pages/reports/ReportsPage';
import ProfilePage from './pages/profile/ProfilePage';
import AppLayout from './components/layout/AppLayout';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
      <BrowserRouter>
        <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
          >
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="ai" element={<AiPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;