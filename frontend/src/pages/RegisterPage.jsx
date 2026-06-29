import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('buyer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { saveToken } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, role)
      const data = await login(email, password)
      saveToken(data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Регистрация</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <label>Роль</label>
          <div className="role-select">
            <label className={`role-option ${role === 'buyer' ? 'active' : ''}`}>
              <input
                type="radio"
                value="buyer"
                checked={role === 'buyer'}
                onChange={() => setRole('buyer')}
              />
              Покупатель
            </label>
            <label className={`role-option ${role === 'seller' ? 'active' : ''}`}>
              <input
                type="radio"
                value="seller"
                checked={role === 'seller'}
                onChange={() => setRole('seller')}
              />
              Продавец
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </div>
    </div>
  )
}