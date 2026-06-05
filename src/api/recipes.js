import api from './client'

// --- Аутентификация ---
export const register = (data) => api.post('/registration', data)
export const login = (data) => api.post('/auth', data)
export const getUser = () => api.get('/user')

// --- Рецепты ---
export const getRecipes = () => api.get('/recipes')
export const getRecipe = (id) => api.get(`/recipes/${id}`)
export const getMyRecipes = () => api.get('/my-recipes')
export const createRecipe = (formData) => api.post('/recipes', formData)
// Изменение рецепта: POST с _method=patch внутри FormData.
export const updateRecipe = (id, formData) => api.post(`/recipes/${id}`, formData)
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`)

// --- Ингредиенты ---
export const getIngredients = () => api.get('/ingredients')

// Преобразование ответа ошибки валидации (422) в объект { поле: "текст" }.
export function parseApiErrors(error) {
  const res = error?.response
  if (res && res.status === 422 && res.data?.errors) {
    const out = {}
    for (const [field, messages] of Object.entries(res.data.errors)) {
      out[field] = Array.isArray(messages) ? messages[0] : String(messages)
    }
    return out
  }
  return null
}

// Общее текстовое сообщение об ошибке.
export function errorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Произошла ошибка. Попробуйте ещё раз.'
  )
}
