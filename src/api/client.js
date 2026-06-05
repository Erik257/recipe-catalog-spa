import axios from 'axios'
import { API_BASE, CLIENT } from '../config'

// Экземпляр axios с обязательными заголовками API.
const api = axios.create({
  baseURL: API_BASE,
})

api.interceptors.request.use((config) => {
  config.headers['Accept'] = 'application/json'
  config.headers['Client'] = CLIENT
  // JSON по умолчанию; для FormData axios сам выставит multipart/form-data.
  if (!(config.data instanceof FormData) && config.method !== 'get') {
    config.headers['Content-Type'] = 'application/json'
  }
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default api
