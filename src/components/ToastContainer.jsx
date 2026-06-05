import { Link } from 'react-router-dom'
import { useNotifications } from '../notifications/NotificationsContext'

// Контейнер всплывающих уведомлений о новых рецептах (WebSocket).
export default function ToastContainer() {
  const { toasts, remove } = useNotifications()

  if (!toasts.length) return null

  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <button
            type="button"
            className="toast__close"
            onClick={() => remove(t.id)}
            aria-label="Закрыть"
          >
            ×
          </button>
          <div className="toast__title">Новый рецепт!</div>
          <Link to={`/recipes/${t.recipeId}`} className="toast__link" onClick={() => remove(t.id)}>
            {t.name}
          </Link>
        </div>
      ))}
    </div>
  )
}
