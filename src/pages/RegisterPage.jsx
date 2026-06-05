import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register as apiRegister, parseApiErrors, errorMessage } from '../api/recipes'
import FieldError from '../components/FieldError'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState({})
  const [common, setCommon] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  // Клиентская валидация (повтор пароля и согласие — только на клиенте).
  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Введите имя'
    if (!form.email.trim()) e.email = 'Введите email'
    if (!form.password) e.password = 'Введите пароль'
    else if (form.password.length < 6) e.password = 'Минимум 6 символов'
    else if (!/^[A-Za-z0-9!@#$%^&*()_+\-=]+$/.test(form.password))
      e.password = 'Пароль должен содержать только латиницу'
    if (form.password_confirmation !== form.password)
      e.password_confirmation = 'Пароли не совпадают'
    if (!consent) e.consent = 'Необходимо согласие на обработку персональных данных'
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
    setSubmitting(true)
    try {
      await apiRegister({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      // После успешной регистрации — на страницу авторизации.
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      const apiErrors = parseApiErrors(err)
      if (apiErrors) setErrors(apiErrors)
      else setCommon(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <h1 className="auth-form__title">Регистрация</h1>

        {common && <div className="alert alert--error">{common}</div>}

        <label className="field">
          <span className="field__label">Имя</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            className={errors.name ? 'input input--invalid' : 'input'}
          />
          <FieldError error={errors.name} />
        </label>

        <label className="field">
          <span className="field__label">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className={errors.email ? 'input input--invalid' : 'input'}
          />
          <FieldError error={errors.email} />
        </label>

        <label className="field">
          <span className="field__label">Пароль</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className={errors.password ? 'input input--invalid' : 'input'}
          />
          <FieldError error={errors.password} />
        </label>

        <label className="field">
          <span className="field__label">Повторите пароль</span>
          <input
            type="password"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={onChange}
            className={errors.password_confirmation ? 'input input--invalid' : 'input'}
          />
          <FieldError error={errors.password_confirmation} />
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked)
              setErrors((prev) => ({ ...prev, consent: undefined }))
            }}
          />
          <span>Согласен на обработку персональных данных</span>
        </label>
        <FieldError error={errors.consent} />

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Регистрация…' : 'Зарегистрироваться'}
        </button>

        <p className="auth-form__hint">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  )
}
