import { useState, useEffect, useRef } from 'react'
import styles from './TaskModal.module.css'

const CATS = [
  { value: 'cours', label: 'Cours / RT' },
  { value: 'projet', label: 'Projet' },
  { value: 'perso', label: 'Perso' },
  { value: 'exam', label: 'Exam / DS' },
]

export default function TaskModal({ defaultDay, onClose, onAdd }) {
  const [text, setText] = useState('')
  const [category, setCategory] = useState('cours')
  const [dayDate, setDayDate] = useState(defaultDay || '')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (!text.trim()) return
    onAdd({ text: text.trim(), category, dayDate: dayDate || null })
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Nouvelle tâche</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <textarea
          ref={inputRef}
          className={styles.textInput}
          placeholder="Description de la tâche..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
          maxLength={200}
        />

        <div className={styles.row}>
          <label className={styles.label}>Catégorie</label>
          <div className={styles.catGrid}>
            {CATS.map(c => (
              <button
                key={c.value}
                className={`${styles.catBtn} ${styles[c.value]} ${category === c.value ? styles.catSelected : ''}`}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <label className={styles.label}>Planifier sur un jour <span className={styles.opt}>(optionnel)</span></label>
          <input
            type="date"
            className={styles.dateInput}
            value={dayDate}
            onChange={e => setDayDate(e.target.value)}
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Annuler</button>
          <button className={styles.addBtn} onClick={handleSubmit} disabled={!text.trim()}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}
