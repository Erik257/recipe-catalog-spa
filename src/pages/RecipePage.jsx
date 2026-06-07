import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getRecipe, errorMessage } from '../api/recipes'
import { formatDate, imageUrl, splitDescription } from '../utils/format'
import { dishImage } from '../utils/dishImage'
import { dishSteps } from '../utils/dishSteps'

export default function RecipePage() {
  const { id } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getRecipe(id)
      .then((res) => {
        if (active) setRecipe(res.data)
      })
      .catch((err) => {
        if (active) setError(errorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <div className="loader">Загрузка…</div>
  if (error) return <div className="alert alert--error">{error}</div>
  if (!recipe) return null

  const { description, method } = splitDescription(recipe.description)
  const embeddedSteps = method
    .split('\n')
    .map((s) => s.replace(/^\s*\d+[).]\s*/, '').trim())
    .filter(Boolean)
  // Если способ приготовления не задан в рецепте — подставляем по названию.
  const steps = embeddedSteps.length ? embeddedSteps : dishSteps(recipe.name)

  return (
    <article className="recipe-view">
      <Link to="/" className="back-link">
        ← К списку рецептов
      </Link>

      <div className="recipe-view__grid">
        <img
          className="recipe-view__image"
          src={recipe.image_url ? imageUrl(recipe.image_url) : dishImage(recipe.name)}
          alt={recipe.name}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = dishImage(recipe.name)
          }}
        />
        <div className="recipe-view__info">
          <h1 className="recipe-view__title">{recipe.name}</h1>
          {recipe.created_at && (
            <div className="recipe-view__date">Создан: {formatDate(recipe.created_at)}</div>
          )}
          <div className="recipe-view__meta">
            <span className="badge">🔥 {recipe.calorie} ккал</span>
            <span className="badge">⏱ {recipe.coocking_time} мин</span>
          </div>
          <p className="recipe-view__desc">{description}</p>
        </div>
      </div>

      <h2 className="section-subtitle">Ингредиенты</h2>
      {recipe.ingredients && recipe.ingredients.length ? (
        <ul className="ingredient-list">
          {recipe.ingredients.map((ing, i) => (
            <li key={ing.id ?? i} className="ingredient-list__item">
              <span className="ingredient-list__name">{ing.name}</span>
              {ing.description && (
                <span className="ingredient-list__qty">{ing.description}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">Ингредиенты не указаны.</p>
      )}

      {steps.length > 0 && (
        <>
          <h2 className="section-subtitle">Способ приготовления</h2>
          <ol className="steps-list">
            {steps.map((s, i) => (
              <li key={i} className="steps-list__item">
                {s}
              </li>
            ))}
          </ol>
        </>
      )}
    </article>
  )
}
