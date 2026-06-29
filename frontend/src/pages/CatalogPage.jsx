import { useEffect, useState } from 'react'
import { getProducts, getCategories, getProductsByCategory } from '../api/client'

export default function CatalogPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    const fetch = selectedCategory
      ? getProductsByCategory(selectedCategory)
      : getProducts()
    fetch
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [selectedCategory])

  return (
    <div className="page">
      <h1>Каталог товаров</h1>

      <div className="category-filter">
        <button
          className={`chip ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && <p className="loading">Загрузка...</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <p className="empty">Товары не найдены.</p>
      )}

      <div className="product-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="product-img" />
            ) : (
              <div className="product-img-placeholder">📦</div>
            )}
            <div className="product-info">
              <h3>{p.name}</h3>
              {p.description && <p className="product-desc">{p.description}</p>}
              <div className="product-footer">
                <span className="product-price">{Number(p.price).toFixed(2)} ₽</span>
                <span className="product-stock">На складе: {p.stock}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}