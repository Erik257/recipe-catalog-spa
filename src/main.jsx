import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { NotificationsProvider } from './notifications/NotificationsContext'
import './styles.css'

// HashRouter — чтобы маршрутизация работала при статической раздаче
// сборки с сервера без дополнительной настройки rewrite-правил.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
)
