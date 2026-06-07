import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getRecipe,
  getRecipes,
  getIngredients,
  createRecipe,
  updateRecipe,
  parseApiErrors,
  errorMessage,
} from '../api/recipes'
import { imageUrl, PLACEHOLDER_IMG } from '../utils/format'
import FieldError from '../components/FieldError'

const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2 Мб
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

let rowUid = 1
const emptyRow = () => ({ uid: rowUid++, mode: 'select', id: '', name: '', description: '' })

export default function RecipeFormPage({ mode }) {
  const isEdit = mode === 'edit'
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', description: '', calorie: '', coocking_time: '' })
  const [rows, setRows] = useState([emptyRow()])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [existingImage, setExistingImage] = useState('')

  const [ingredientOptions, setIngredientOptions] = useState([])
  const [errors, setErrors] = useState({})
  const [common, setCommon] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  // Справочник ингредиентов для выпадающего списка
  // (из /ingredients и из ингредиентов существующих рецептов).
  useEffect(() => {
    Promise.all([getIngredients(), getRecipes()])
      .then(([ingRes, recRes]) => {
        const map = new Map()
        const add = (o) => {
          if (o?.id != null && o.name && !map.has(o.id)) map.set(o.id, { id: o.id, name: o.name })
        }
        ;(Array.isArray(ingRes.data) ? ingRes.data : []).forEach(add)
        ;(Array.isArray(recRes.data) ? recRes.data : []).forEach((r) =>
          (r.ingredients || []).forEach(add)
        )
        setIngredientOptions([...map.values()])
      })
      .catch(() => setIngredientOptions([]))
  }, [])

  // Загрузка рецепта в режиме редактирования.
  useEffect(() => {
    if (!isEdit) return
    let active = true
    setLoading(true)
    getRecipe(id)
      .then((res) => {
        if (!active) return
        const r = res.data
        setForm({
          name: r.name ?? '',
          description: r.description ?? '',
          calorie: String(r.calorie ?? ''),
          coocking_time: String(r.coocking_time ?? ''),
        })
        setExistingImage(r.image_url ? imageUrl(r.image_url) : '')
        const loadedRows = (r.ingredients || []).map((ing) => ({
          uid: rowUid++,
          mode: ing.id != null ? 'select' : 'custom',
          id: ing.id != null ? String(ing.id) : '',
          name: ing.name ?? '',
          description: ing.description ?? '',
        }))
        setRows(loadedRows.length ? loadedRows : [emptyRow()])
      })
      .catch((err) => active && setCommon(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [isEdit, id])

  const onField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  // --- Ингредиенты ---
  const updateRow = (uid, patch) =>
    setRows((list) => list.map((r) => (r.uid === uid ? { ...r, ...patch } : r)))
  const addRow = () => setRows((list) => [...list, emptyRow()])
  const removeRow = (uid) =>
    setRows((list) => (list.length > 1 ? list.filter((r) => r.uid !== uid) : list))

  const onSelectIngredient = (uid, value) => {
    if (value === '__custom__') {
      updateRow(uid, { mode: 'custom', id: '', name: '' })
    } else {
      const opt = ingredientOptions.find((o) => String(o.id) === value)
      updateRow(uid, { mode: 'select', id: value, name: opt?.name ?? '' })
    }
  }

  // --- Изображение ---
  const onImageChange = (e) => {
    const file = e.target.files?.[0]
    setErrors((prev) => ({ ...prev, image: undefined }))
    if (!file) {
      setImageFile(null)
      setImagePreview('')
      return
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Допустимы только файлы JPEG, JPG или PNG' }))
      e.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, image: 'Размер файла не должен превышать 2 Мб' }))
      e.target.value = ''
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Освобождаем object URL.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Введите название'
    if (!form.description.trim()) e.description = 'Введите описание'
    if (form.calorie === '' || Number(form.calorie) < 0) e.calorie = 'Укажите калорийность'
    if (form.coocking_time === '' || Number(form.coocking_time) < 0)
      e.coocking_time = 'Укажите время приготовления'

    const validRows = rows.filter(
      (r) => (r.mode === 'select' ? r.id : r.name.trim()) && r.description.trim()
    )
    if (validRows.length === 0) e.ingredients = 'Добавьте хотя бы один ингредиент с количеством'

    if (!isEdit && !imageFile) e.image = 'Загрузите изображение'
    return e
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setCommon('')
    const clientErrors = validate()
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors)
      return
    }

    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('description', form.description)
    fd.append('calorie', String(form.calorie))
    fd.append('coocking_time', String(form.coocking_time))

    const validRows = rows.filter(
      (r) => (r.mode === 'select' ? r.id : r.name.trim()) && r.description.trim()
    )
    validRows.forEach((r, i) => {
      if (r.mode === 'select' && r.id) {
        fd.append(`ingredients[${i}][id]`, r.id)
      } else {
        fd.append(`ingredients[${i}][name]`, r.name.trim())
      }
      fd.append(`ingredients[${i}][description]`, r.description.trim())
    })

    if (imageFile) fd.append('image', imageFile)
    if (isEdit) fd.append('_method', 'patch')

    setSubmitting(true)
    try {
      if (isEdit) await updateRecipe(id, fd)
      else await createRecipe(fd)
      navigate('/my-recipes')
    } catch (err) {
      const apiErrors = parseApiErrors(err)
      if (apiErrors) {
        // Приводим ключи вида coocking_time / ingredients.0.description.
        setErrors(apiErrors)
        setCommon(err.response?.data?.message || '')
      } else {
        setCommon(errorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const ingredientRowError = (i) =>
    errors[`ingredients.${i}.description`] ||
    errors[`ingredients.${i}.name`] ||
    errors[`ingredients.${i}.id`]

  const sortedOptions = useMemo(
    () => [...ingredientOptions].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [ingredientOptions]
  )

  if (loading) return <div className="loader">Загрузка…</div>

  return (
    <section className="form-page">
      <h1 className="page-title">{isEdit ? 'Редактирование рецепта' : 'Новый рецепт'}</h1>

      {common && <div className="alert alert--error">{common}</div>}

      <form onSubmit={onSubmit} noValidate className="recipe-form">
        <label className="field">
          <span className="field__label">Название</span>
          <input
            name="name"
            value={form.name}
            onChange={onField}
            className={errors.name ? 'input input--invalid' : 'input'}
          />
          <FieldError error={errors.name} />
        </label>

        <label className="field">
          <span className="field__label">Описание</span>
          <textarea
            name="description"
            value={form.description}
            onChange={onField}
            rows={4}
            className={errors.description ? 'input input--invalid' : 'input'}
          />
          <FieldError error={errors.description} />
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Калорийность (ккал)</span>
            <input
              type="number"
              name="calorie"
              min="0"
              value={form.calorie}
              onChange={onField}
              className={errors.calorie ? 'input input--invalid' : 'input'}
            />
            <FieldError error={errors.calorie} />
          </label>

          <label className="field">
            <span className="field__label">Время приготовления (мин)</span>
            <input
              type="number"
              name="coocking_time"
              min="0"
              value={form.coocking_time}
              onChange={onField}
              className={errors.coocking_time ? 'input input--invalid' : 'input'}
            />
            <FieldError error={errors.coocking_time} />
          </label>
        </div>

        {/* Изображение */}
        <div className="field">
          <span className="field__label">Изображение (JPEG/JPG/PNG, до 2 Мб)</span>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={onImageChange}
            className={errors.image ? 'input input--invalid' : 'input'}
          />
          <FieldError error={errors.image} />

          <div className="image-previews">
            {isEdit && existingImage && (
              <figure className="image-previews__item">
                <figcaption>Текущее</figcaption>
                <img
                  src={existingImage}
                  alt="Текущее изображение"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMG
                  }}
                />
              </figure>
            )}
            {imagePreview && (
              <figure className="image-previews__item">
                <figcaption>{isEdit ? 'Новое' : 'Предпросмотр'}</figcaption>
                <img src={imagePreview} alt="Новое изображение" />
              </figure>
            )}
            {!imagePreview && !existingImage && (
              <img className="image-previews__placeholder" src={PLACEHOLDER_IMG} alt="" />
            )}
          </div>
        </div>

        {/* Ингредиенты */}
        <div className="field">
          <span className="field__label">Ингредиенты</span>
          <FieldError error={errors.ingredients} />
          <div className="ingredient-rows">
            {rows.map((row, i) => (
              <div key={row.uid} className="ingredient-row">
                {row.mode === 'select' ? (
                  <select
                    className="input"
                    value={row.id || ''}
                    onChange={(e) => onSelectIngredient(row.uid, e.target.value)}
                  >
                    <option value="">— выберите ингредиент —</option>
                    {sortedOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                    <option value="__custom__">+ Добавить свой…</option>
                  </select>
                ) : (
                  <input
                    className="input"
                    placeholder="Название ингредиента"
                    value={row.name}
                    onChange={(e) => updateRow(row.uid, { name: e.target.value })}
                  />
                )}

                <input
                  className="input"
                  placeholder="Количество (напр. 100 гр.)"
                  value={row.description}
                  onChange={(e) => updateRow(row.uid, { description: e.target.value })}
                />

                {row.mode === 'custom' && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => updateRow(row.uid, { mode: 'select', name: '', id: '' })}
                    title="Выбрать из списка"
                  >
                    ↩
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => removeRow(row.uid)}
                  disabled={rows.length === 1}
                  title="Удалить ингредиент"
                >
                  ×
                </button>
                {ingredientRowError(i) && (
                  <span className="field-error ingredient-row__error">
                    {ingredientRowError(i)}
                  </span>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={addRow}>
            + Добавить ингредиент
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Сохранение…' : isEdit ? 'Сохранить изменения' : 'Создать рецепт'}
          </button>
        </div>
      </form>
    </section>
  )
}
