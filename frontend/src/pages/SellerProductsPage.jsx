import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMyProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/client'
import { useAuth } from '../context/AuthContext'

const emptyForm = { name: '', description: '', price: '', image_url: '', stock: '', category_id: '' }

export default function SellerProductsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/')
      return
    }
    reload()
    getCategories().then(setCategories).catch(() => {})
  }, [])

  const reload = () =>
    getMyProducts()
      .then(setProducts)
      .catch(() => {})

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
    setError('')
  }

  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      image_url: p.image_url || '',
      stock: p.stock,
      category_id: p.category_id,
    })
    setEditingId(p.id)
    setShowForm(true)
    setError('')
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category_id: parseInt(form.category_id),
      description: form.description || null,
      image_url: form.image_url || null,
    }
    try {
      if (editingId) {
        await updateProduct(editingId, payload)
      } else {
        await createProduct(payload)
      }
      await reload()
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить товар?')) return
    try {
      await deleteProduct(id)
      await reload()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Мои товары</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Добавить товар</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Редактировать товар' : 'Новый товар'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <label>Название *</label>
              <input name="name" value={form.name} onChange={handleChange} required minLength={3} maxLength={100} />
              <label>Описание</label>
              <textarea name="description" value={form.description} onChange={handleChange} maxLength={500} rows={3} />
              <label>Цена (₽) *</label>
              <input name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={handleChange} required />
              <label>URL изображения</label>
              <input name="image_url" value={form.image_url} onChange={handleChange} maxLength={200} />
              <label>Количество на складе *</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
              <label>Категория *</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">Выберите категорию</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <p className="empty">У вас пока нет товаров.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Цена</th>
              <th>Склад</th>
              <th>Категория</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{Number(p.price).toFixed(2)} ₽</td>
                <td>{p.stock}</td>
                <td>{categories.find((c) => c.id === p.category_id)?.name || p.category_id}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>Изменить</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}