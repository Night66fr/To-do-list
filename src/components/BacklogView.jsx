import { useState } from 'react'
import { format } from 'date-fns'
import TaskCard from './TaskCard'
import styles from './BacklogView.module.css'

const CATS = ['all', 'cours', 'projet', 'perso', 'exam']
const CAT_LABELS = { all: 'Tout', cours: 'Cours', projet: 'Projet', perso: 'Perso', exam: 'Exam' }

export default function BacklogView({ tasks, onToggle, onDelete, onAdd, onAssignDay }) {
  const [filter, setFilter] = useState('all')
  const [showDone, setShowDone] = useState(false)
  const [assignTarget, setAssignTarget] = useState(null)
  const [assignDate, setAssignDate] = useState('')

  const backlog = tasks.filter(t => !t.day_date)
  const scheduled = tasks.filter(t => t.day_date)

  const filtered = backlog.filter(t => {
    if (!showDone && t.done) return false
    if (filter !== 'all' && t.category !== filter) return false
    return true
  })

  const handleAssign = async (id) => {
    if (!assignDate) return
    await onAssignDay(id, assignDate)
    setAssignTarget(null)
    setAssignDate('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.cols}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Backlog</h2>
            <span className={styles.sectionCount}>{backlog.filter(t => !t.done).length} restantes</span>
          </div>

          <div className={styles.filters}>
            <div className={styles.catFilters}>
              {CATS.map(c => (
                <button
                  key={c}
                  className={`${styles.catBtn} ${filter === c ? styles.catActive : ''}`}
                  onClick={() => setFilter(c)}
                >
                  {CAT_LABELS[c]}
                </button>
              ))}
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={showDone} onChange={e => setShowDone(e.target.checked)} />
              <span>Voir terminées</span>
            </label>
          </div>

          <div className={styles.taskList}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>Aucune tâche ici</div>
            ) : (
              filtered.map(t => (
                <div key={t.id} className={styles.taskRow}>
                  <TaskCard task={t} onToggle={onToggle} onDelete={onDelete} onAssignDay={onAssignDay} />
                  <button
                    className={styles.scheduleBtn}
                    onClick={() => setAssignTarget(assignTarget === t.id ? null : t.id)}
                    title="Planifier sur un jour"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <rect x="1" y="2" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M1 5h11M4 1v2M9 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </button>
                  {assignTarget === t.id && (
                    <div className={styles.assignPop}>
                      <input
                        type="date"
                        value={assignDate}
                        onChange={e => setAssignDate(e.target.value)}
                        className={styles.dateInput}
                      />
                      <button className={styles.assignConfirm} onClick={() => handleAssign(t.id)}>OK</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <button className={styles.addBtn} onClick={onAdd}>+ Ajouter au backlog</button>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Planifiées</h2>
            <span className={styles.sectionCount}>{scheduled.length} tâches</span>
          </div>

          <div className={styles.taskList}>
            {scheduled.length === 0 ? (
              <div className={styles.empty}>Aucune tâche planifiée</div>
            ) : (
              [...scheduled]
                .sort((a, b) => a.day_date.localeCompare(b.day_date))
                .map(t => (
                  <TaskCard key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onAssignDay={onAssignDay} showDate />
                ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
