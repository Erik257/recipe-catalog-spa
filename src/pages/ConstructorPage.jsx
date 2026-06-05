import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getIngredients, getRecipes, errorMessage } from '../api/recipes'

// Ключ ингредиента: по id, если есть, иначе по имени.
const keyOf = (ing) =>
  ing.id != null ? `id:${ing.id}` : `name:${String(ing.name).toLowerCase().trim()}`

export default function ConstructorPage() {
  const [allIngredients, setAllIngredients] = useState([])
  const [recipes, setRecipes] = useState([])
  const [selectedKeys, setSelectedKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dragKey, setDragKey] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([getIngredients(), getRecipes()])
      .then(([ingRes, recRes]) => {
        if (!active) return
        const recipesData = Array.isArray(recRes.data) ? recRes.data : []
        setRecipes(recipesData)

        // Базовый справочник ингредиентов + те, что встречаются в рецептах.
        const map = new Map()
        const add = (ing) => {
          if (!ing?.name) return
          const k = keyOf(ing)
          if (!map.has(k)) map.set(k, { id: ing.id ?? null, name: ing.name })
        }
        ;(Array.isArray(ingRes.data) ? ingRes.data : []).forEach(add)
        recipesData.forEach((r) => (r.ingredients || []).forEach(add))

        const list = [...map.values()].sort((a, b) =>
          a.name.localeCompare(b.name, 'ru')
        )
        setAllIngredients(list)
      })
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const byKey = useMemo(() => {
    const m = new Map()
    allIngredients.forEach((i) => m.set(keyOf(i), i))
    return m
  }, [allIngredients])

  const available = allIngredients.filter((i) => !selectedKeys.includes(keyOf(i)))
  const selected = selectedKeys.map((k) => byKey.get(k)).filter(Boolean)

  // Рецепты, содержащие ВСЕ выбранные ингредиенты.
  const matched = useMemo(() => {
    if (selectedKeys.length === 0) return recipes
    return recipes.filter((r) => {
      const recipeKeys = new Set((r.ingredients || []).map(keyOf))
      return selectedKeys.every((k) => recipeKeys.has(k))
    })
  }, [recipes, selectedKeys])

  const addToSelected = (key) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
  }
  const removeFromSelected = (key) => {
    setSelectedKeys((prev) => prev.filter((k) => k !== key))
  }

  // --- Drag & drop ---
  const onDragStart = (e, key) => {
    setDragKey(key)
    e.dataTransfer.setData('text/plain', key)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDropToSelected = (e) => {
    e.preventDefault()
    const key = e.dataTransfer.getData('text/plain') || dragKey
    if (key) addToSelected(key)
    setDragKey(null)
  }
  const onDropToAvailable = (e) => {
    e.preventDefault()
    const key = e.dataTransfer.getData('text/plain') || dragKey
    if (key) removeFromSelected(key)
    setDragKey(null)
  }
  const allowDrop = (e) => e.preventDefault()

  if (loading) return <div className="loader">Загрузка…</div>

  return (
    <section>
      <h1 className="page-title">Конструктор рецептов</h1>
      <p className="page-subtitle">
        Перетащите ингредиенты в область «Выбранные» — ниже появятся рецепты, в которых
        присутствуют все выбранные ингредиенты. Чтобы убрать ингредиент, перетащите его обратно.
      </p>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="constructor">
        <div
          className="dropzone"
          onDragOver={allowDrop}
          onDrop={onDropToAvailable}
        >
          <h3 className="dropzone__title">Все ингредиенты</h3>
          <div className="chips">
            {available.map((ing) => {
              const k = keyOf(ing)
              return (
                <div
                  key={k}
                  className="chip"
                  draggable
                  onDragStart={(e) => onDragStart(e, k)}
                  onClick={() => addToSelected(k)}
                  title="Перетащите или нажмите, чтобы выбрать"
                >
                  {ing.name}
                </div>
              )
            })}
            {available.length === 0 && <span className="muted">Список пуст</span>}
          </div>
        </div>

        <div
          className="dropzone dropzone--accent"
          onDragOver={allowDrop}
          onDrop={onDropToSelected}
        >
          <h3 className="dropzone__title">Выбранные ингредиенты</h3>
          <div className="chips">
            {selected.map((ing) => {
              const k = keyOf(ing)
              return (
                <div
                  key={k}
                  className="chip chip--selected"
                  draggable
                  onDragStart={(e) => onDragStart(e, k)}
                  onClick={() => removeFromSelected(k)}
                  title="Перетащите обратно или нажмите, чтобы убрать"
                >
                  {ing.name} <span className="chip__x">×</span>
                </div>
              )
            })}
            {selected.length === 0 && (
              <span className="muted">Перетащите сюда ингредиенты</span>
            )}
          </div>
        </div>
      </div>

      <h2 className="section-subtitle">
        Найденные рецепты {selectedKeys.length > 0 && `(${matched.length})`}
      </h2>
      {matched.length === 0 ? (
        <div className="empty">Нет рецептов с выбранным набором ингредиентов.</div>
      ) : (
        <div className="found-list">
          {matched.map((r) => (
            <div key={r.id} className="found-item">
              <span className="found-item__name">{r.name}</span>
              <Link to={`/recipes/${r.id}`} className="btn btn--ghost btn--sm">
                Открыть
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
