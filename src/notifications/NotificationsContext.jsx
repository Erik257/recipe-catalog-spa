import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { WS_URL, CLIENT } from '../config'

const NotificationsContext = createContext(null)

let nextId = 1

export function NotificationsProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const push = useCallback(
    (toast) => {
      const id = nextId++
      setToasts((list) => [...list, { ...toast, id }])
      // Уведомление исчезает автоматически через 3 секунды.
      timers.current[id] = setTimeout(() => remove(id), 3000)
    },
    [remove]
  )

  // Подключение к WebSocket и прослушивание новых рецептов.
  useEffect(() => {
    if (!WS_URL) return
    let ws
    let reconnectTimer
    let closed = false

    const connect = () => {
      try {
        const url = `${WS_URL}${WS_URL.includes('?') ? '&' : '?'}client=${encodeURIComponent(CLIENT)}`
        ws = new WebSocket(url)
      } catch {
        return
      }

      ws.onmessage = (event) => {
        let data
        try {
          data = JSON.parse(event.data)
        } catch {
          return
        }
        if (data?.type === 'recipe.created' && data.recipe) {
          push({
            recipeId: data.recipe.id,
            name: data.recipe.name,
          })
        }
      }

      ws.onclose = () => {
        // Переподключение, если соединение не было закрыто намеренно.
        if (!closed) {
          reconnectTimer = setTimeout(connect, 5000)
        }
      }

      ws.onerror = () => {
        try {
          ws.close()
        } catch {
          /* игнорируем */
        }
      }
    }

    connect()

    return () => {
      closed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (ws) {
        try {
          ws.close()
        } catch {
          /* игнорируем */
        }
      }
    }
  }, [push])

  return (
    <NotificationsContext.Provider value={{ toasts, remove, push }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications должен использоваться внутри NotificationsProvider')
  return ctx
}
