// Модальное окно подтверждения действия (например, удаление рецепта).
export default function ConfirmModal({ open, title, message, onConfirm, onCancel, busy }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal__title">{title}</h3>
        <p className="modal__message">{message}</p>
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
            Отмена
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Удаление…' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  )
}
