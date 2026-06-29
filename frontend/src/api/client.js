const BASE_URL = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Ошибка запроса')
  }
  if (res.status === 204) return null
  return res.json()
}

// Auth
export const login = (email, password) => {
  const body = new URLSearchParams({ username: email, password })
  return fetch(`${BASE_URL}/users/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Ошибка входа')
    }
    return res.json()
  })
}

export const register = (email, password, role) =>
  request('/users/', { method: 'POST', body: JSON.stringify({ email, password, role }) })

// Categories
export const getCategories = () => request('/categories/')
export const createCategory = (data) =>
  request('/categories/', { method: 'POST', body: JSON.stringify(data) })
export const updateCategory = (id, data) =>
  request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCategory = (id) =>
  request(`/categories/${id}`, { method: 'DELETE' })

// Products
export const getProducts = () => request('/products/')
export const getMyProducts = () => request('/products/my')
export const getProductsByCategory = (categoryId) =>
  request(`/products/category/${categoryId}`)
export const getProduct = (id) => request(`/products/${id}`)
export const createProduct = (data) =>
  request('/products/', { method: 'POST', body: JSON.stringify(data) })
export const updateProduct = (id, data) =>
  request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteProduct = (id) =>
  request(`/products/${id}`, { method: 'DELETE' })
