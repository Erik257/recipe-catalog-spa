import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <NavLink to="/" className="navbar__brand">
           Каталог&nbsp;рецептов
        </NavLink>

        <nav className="navbar__links">
          <NavLink to="/" end className="navbar__link">
            Рецепты
          </NavLink>
          <NavLink to="/constructor" className="navbar__link">
            Конструктор
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/my-recipes" className="navbar__link">
                Мои рецепты
              </NavLink>
              <NavLink to="/recipes/new" className="navbar__link navbar__link--accent">
                + Добавить
              </NavLink>
              <span className="navbar__user" title={user?.email}>
                {user?.name || 'Профиль'}
              </span>
              <button type="button" className="navbar__logout" onClick={handleLogout}>
                Выход
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navbar__link">
                Вход
              </NavLink>
              <NavLink to="/register" className="navbar__link navbar__link--accent">
                Регистрация
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
