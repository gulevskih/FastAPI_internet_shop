import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/client'
import { useAuth } from '../context/AuthContext'

const emptyForm = { name: '', parent_id: '' }

export default function CategoriesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

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
  }, [])

  const reload = () => getCategories().then(setCategories).catch(() => {})

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
    setError('')
  }

  const openEdit = (c) => {
    setForm({ name: c.name, parent_id: c.parent_id ?? '' })
    setEditingId(c.id)
    setShowForm(true)
    setError('')
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const payload = {
      name: form.name,
      parent_id: form.parent_id ? parseInt(form.parent_id) : null,
    }
    try {
      if (editingId) {
        await updateCategory(editingId, payload)
      } else {
        await createCategory(payload)
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
    if (!confirm('Удалить категорию?')) return
    try {
      await deleteCategory(id)
      await reload()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Категории</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Добавить категорию</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Редактировать категорию' : 'Новая категория'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <label>Название *</label>
              <input name="name" value={form.name} onChange={handleChange} required minLength={3} maxLength={50} />
              <label>Родительская категория</label>
              <select name="parent_id" value={form.parent_id} onChange={handleChange}>
                <option value="">Нет (корневая)</option>
                {categories
                  .filter((c) => c.id !== editingId)
                  .map((c) => (
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

      {categories.length === 0 ? (
        <p className="empty">Категорий пока нет.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Родитель</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.parent_id ? categories.find((x) => x.id === c.parent_id)?.name ?? c.parent_id : '—'}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(c)}>Изменить</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}