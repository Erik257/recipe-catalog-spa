import { useEffect, useMemo, useState } from 'react'
import { getRecipes, errorMessage } from '../api/recipes'
import RecipeCard from '../components/RecipeCard'

const SORT_FIELDS = [
  { value: 'created_at', label: 'По дате создания' },
  { value: 'coocking_time', label: 'По времени приготовления' },
  { value: 'calorie', label: 'По калорийности' },
]

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [sortField, setSortField] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'

  useEffect(() => {
    let active = true
    setLoading(true)
    getRecipes()
      .then((res) => {
        if (active) setRecipes(Array.isArray(res.data) ? res.data : [])
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
  }, [])

  const sorted = useMemo(() => {
    const list = [...recipes]
    list.sort((a, b) => {
      let av = a[sortField]
      let bv = b[sortField]
      if (sortField === 'created_at') {
        av = new Date(av).getTime() || 0
        bv = new Date(bv).getTime() || 0
      } else {
        av = Number(av) || 0
        bv = Number(bv) || 0
      }
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return list
  }, [recipes, sortField, sortDir])

  return (
    <section>
      <div className="page-head">
        <h1 className="page-title">Все рецепты</h1>
        <div className="sort-controls">
          <label className="sort-controls__item">
            <span>Сортировка:</span>
            <select
              className="select"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              {SORT_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            title="Изменить направление сортировки"
          >
            {sortDir === 'asc' ? '↑ по возрастанию' : '↓ по убыванию'}
          </button>
        </div>
      </div>

      {loading && <div className="loader">Загрузка рецептов…</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {!loading && !error && sorted.length === 0 && (
        <div className="empty">Рецептов пока нет.</div>
      )}

      <div className="grid">
        {sorted.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  )
}
