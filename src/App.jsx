import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RecipesPage from './pages/RecipesPage'
import RecipePage from './pages/RecipePage'
import ConstructorPage from './pages/ConstructorPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyRecipesPage from './pages/MyRecipesPage'
import RecipeFormPage from './pages/RecipeFormPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<RecipesPage />} />
        <Route path="recipes/:id" element={<RecipePage />} />
        <Route path="constructor" element={<ConstructorPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route
          path="my-recipes"
          element={
            <ProtectedRoute>
              <MyRecipesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="recipes/new"
          element={
            <ProtectedRoute>
              <RecipeFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="recipes/:id/edit"
          element={
            <ProtectedRoute>
              <RecipeFormPage mode="edit" />
            </ProtectedRoute>
          }
        />

        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}
