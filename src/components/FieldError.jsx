// Текст ошибки валидации под полем формы.
export default function FieldError({ error }) {
  if (!error) return null
  return <span className="field-error">{error}</span>
}
