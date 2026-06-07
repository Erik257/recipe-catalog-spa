import { SITE_URL } from '../config'

// В API нет отдельного поля для способа приготовления — храним его
// внутри description после разделителя.
export const METHOD_SEP = '\n\n— Способ приготовления —\n'

export function splitDescription(desc = '') {
  const text = desc || ''
  const i = text.indexOf(METHOD_SEP)
  if (i === -1) return { description: text, method: '' }
  return { description: text.slice(0, i), method: text.slice(i + METHOD_SEP.length) }
}

export function joinDescription(description, method) {
  const d = (description || '').trim()
  const m = (method || '').trim()
  return m ? `${d}${METHOD_SEP}${m}` : d
}

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
