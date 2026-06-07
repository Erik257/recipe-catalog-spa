// Подбор изображения блюда по названию (используется, если сервер
// не отдаёт загруженную картинку). Фото включены в сборку.
import tiramisu from '../assets/tiramisu.jpg'
import borscht from '../assets/borscht.jpg'
import carbonara from '../assets/carbonara.jpg'
import foodDefault from '../assets/food-default.jpg'

const RULES = [
  { kw: ['тирамису', 'десерт', 'торт', 'пирог', 'чизкейк', 'мороженое'], img: tiramisu },
  { kw: ['борщ', 'суп', 'щи', 'бульон', 'солянка', 'похлёбка'], img: borscht },
  { kw: ['карбонар', 'паста', 'спагетти', 'макарон', 'лазан', 'ризотто'], img: carbonara },
]

export function dishImage(name = '') {
  const n = String(name).toLowerCase()
  for (const r of RULES) if (r.kw.some((k) => n.includes(k))) return r.img
  return foodDefault
}
