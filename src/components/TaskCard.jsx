import styles from './TaskCard.module.css'

const CAT_LABELS = {
  cours: 'Cours',
  projet: 'Projet',
  perso: 'Perso',
  exam: 'Exam',
}

export default function TaskCard({ task, onToggle, onDelete, onAssignDay, showDate = false }) {
  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm('Supprimer cette tâche ?')) onDelete(task.id)
  }

  return (
    <div className={`${styles.card} ${task.done ? styles.done : ''}`} data-cat={task.category}>
      <button
        className={styles.checkbox}
        onClick={() => onToggle(task.id, task.done)}
        aria-label="Marquer comme fait"
      >
        {task.done && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <polyline points="1.5,4.5 3.5,7 7.5,2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <div className={styles.content}>
        <span className={styles.text}>{task.text}</span>
        <div className={styles.meta}>
          <span className={`${styles.cat} ${styles[task.category]}`}>
            {CAT_LABELS[task.category] || task.category}
          </span>
          {showDate && task.day_date && (
            <span className={styles.date}>{task.day_date}</span>
          )}
        </div>
      </div>
      <button className={styles.del} onClick={handleDelete} aria-label="Supprimer">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
