import axios from 'axios'

const api = axios.create({
  baseURL: VITE_WEBSITE_URL || 'http://localhost:4500/api',
  withCredentials: true,
})

export default api
