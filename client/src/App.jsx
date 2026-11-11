import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import { AdminRoute, PrivateRoute } from "./components/ProtectedRoutes";

import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import SearchPage from "./pages/SearchPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";

import UserProfilePage from "./pages/user/UserProfilePage";
import UserOrdersPage from "./pages/user/UserOrdersPage";

import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* Ambient Frosted Backdrop */}
          <div className="ambient-canvas" aria-hidden="true">
            <div className="ambient-orb ambient-orb-1" />
            <div className="ambient-orb ambient-orb-2" />
            <div className="ambient-orb ambient-orb-3" />
            <div className="ambient-grid" />
          </div>

          <div className="app-shell">
            <Navbar />
            <CartDrawer />

            <main className="app-main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/category/:slug" element={<CategoryProductsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product/:slug" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route
                  path="/resetpassword/:token"
                  element={<ResetPasswordPage />}
                />

                {/* Customer Protected Routes */}
                <Route path="/dashboard/user" element={<PrivateRoute />}>
                  <Route index element={<UserProfilePage />} />
                  <Route path="orders" element={<UserOrdersPage />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route path="/dashboard/admin" element={<AdminRoute />}>
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <Footer />
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(15, 23, 42, 0.88)",
                backdropFilter: "blur(18px)",
                color: "#f8fafc",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                borderRadius: "14px",
                boxShadow: "0 14px 35px rgba(0, 0, 0, 0.45)",
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
