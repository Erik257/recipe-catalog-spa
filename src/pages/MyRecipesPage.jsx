import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyRecipes, deleteRecipe, errorMessage } from '../api/recipes'
import RecipeCard from '../components/RecipeCard'
import ConfirmModal from '../components/ConfirmModal'

export default function MyRecipesPage() {
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    getMyRecipes()
      .then((res) => setRecipes(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteRecipe(toDelete.id)
      setRecipes((list) => list.filter((r) => r.id !== toDelete.id))
      setToDelete(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section>
      <div className="page-head">
        <h1 className="page-title">Мои рецепты</h1>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/recipes/new')}>
          + Добавить рецепт
        </button>
      </div>

      {loading && <div className="loader">Загрузка…</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {!loading && !error && recipes.length === 0 && (
        <div className="empty">У вас пока нет рецептов. Создайте первый!</div>
      )}

      <div className="grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe}>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
            >
              ✏ Редактировать
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => setToDelete(recipe)}
            >
              🗑 Удалить
            </button>
          </RecipeCard>
        ))}
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Удалить рецепт?"
        message={`Рецепт «${toDelete?.name ?? ''}» будет удалён без возможности восстановления.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </section>
  )
}
