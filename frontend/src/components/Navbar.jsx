import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🛒 Магазин</Link>
      <div className="navbar-links">
        <Link to="/">Каталог</Link>
        {user?.role === 'seller' && (
          <>
            <Link to="/seller/products">Мои товары</Link>
            <Link to="/seller/categories">Категории</Link>
          </>
        )}
        {user ? (
          <button onClick={handleLogout} className="btn btn-outline">
            Выйти ({user.sub})
          </button>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register" className="btn btn-primary">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  )
}