import { SITE_URL } from '../config'

// Форматирование даты создания в читаемый вид.
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return iso
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Абсолютный URL изображения (на случай относительного пути от сервера).
export function imageUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

// Заглушка, если у рецепта нет изображения.
export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
       <rect width="100%" height="100%" fill="#eef0f3"/>
       <text x="50%" y="50%" fill="#9aa0a6" font-family="sans-serif"
             font-size="20" text-anchor="middle" dy=".3em">Нет изображения</text>
     </svg>`
  )
