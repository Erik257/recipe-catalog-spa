import { Link } from 'react-router-dom'
import { formatDate, imageUrl } from '../utils/format'
import { dishImage } from '../utils/dishImage'

// Карточка рецепта в списке.
export default function RecipeCard({ recipe, children }) {
  return (
    <article className="card">
      <Link to={`/recipes/${recipe.id}`} className="card__image-wrap">
        <img
          className="card__image"
          src={recipe.image_url ? imageUrl(recipe.image_url) : dishImage(recipe.name)}
          alt={recipe.name}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = dishImage(recipe.name)
          }}
        />
      </Link>
      <div className="card__body">
        <Link to={`/recipes/${recipe.id}`} className="card__title">
          {recipe.name}
        </Link>
        {recipe.created_at && (
          <div className="card__date">{formatDate(recipe.created_at)}</div>
        )}
        {recipe.description && <p className="card__desc">{recipe.description}</p>}
        <div className="card__meta">
          <span className="badge">🔥 {recipe.calorie} ккал</span>
          <span className="badge">⏱ {recipe.coocking_time} мин</span>
        </div>
        {children && <div className="card__actions">{children}</div>}
      </div>
    </article>
  )
}
