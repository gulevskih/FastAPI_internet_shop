import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import CatalogPage from './pages/CatalogPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SellerProductsPage from './pages/SellerProductsPage'
import CategoriesPage from './pages/CategoriesPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/seller/products" element={<SellerProductsPage />} />
            <Route path="/seller/categories" element={<CategoriesPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}