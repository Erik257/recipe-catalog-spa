import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { login as apiLogin, parseApiErrors, errorMessage } from '../api/recipes'
import { useAuth } from '../auth/AuthContext'
import FieldError from '../components/FieldError'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = location.state?.registered

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [common, setCommon] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Введите email'
    if (!form.password) e.password = 'Введите пароль'
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
      const res = await apiLogin(form)
      if (res.data?.token) {
        login(res.data.token)
        navigate('/')
      } else {
        setCommon('Не удалось получить токен авторизации.')
      }
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
        <h1 className="auth-form__title">Вход</h1>

        {justRegistered && (
          <div className="alert alert--success">
            Регистрация прошла успешно. Войдите в систему.
          </div>
        )}
        {common && <div className="alert alert--error">{common}</div>}

        <label className="field">
          <span className="field__label">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className={errors.email ? 'input input--invalid' : 'input'}
            autoComplete="email"
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
            autoComplete="current-password"
          />
          <FieldError error={errors.password} />
        </label>

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Вход…' : 'Войти'}
        </button>

        <p className="auth-form__hint">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  )
}
