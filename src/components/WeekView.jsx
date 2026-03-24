import { useState } from 'react'
import { format, startOfWeek, addDays, addWeeks, isToday, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import TaskCard from './TaskCard'
import styles from './WeekView.module.css'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function WeekView({ tasks, onToggle, onDelete, onAdd, onAssignDay }) {
  const [weekOffset, setWeekOffset] = useState(0)

  const monday = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset)
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  const weekStart = format(days[0], 'd MMM', { locale: fr })
  const weekEnd = format(days[6], 'd MMM yyyy', { locale: fr })

  const weekTasksDone = tasks.filter(t => t.day_date && t.done).length
  const weekTasksTotal = tasks.filter(t => t.day_date).length

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={() => setWeekOffset(w => w - 1)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className={styles.weekLabel}>{weekStart} — {weekEnd}</span>
          <button className={styles.navBtn} onClick={() => setWeekOffset(w => w + 1)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {weekOffset !== 0 && (
            <button className={styles.todayBtn} onClick={() => setWeekOffset(0)}>Aujourd'hui</button>
          )}
        </div>
        <div className={styles.weekStats}>
          <span className={styles.statLabel}>{weekTasksDone}/{weekTasksTotal} tâches</span>
          {weekTasksTotal > 0 && (
            <div className={styles.weekBar}>
              <div className={styles.weekBarFill} style={{ width: `${Math.round(weekTasksDone/weekTasksTotal*100)}%` }} />
            </div>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayTasks = tasks.filter(t => t.day_date === key)
          const doneCnt = dayTasks.filter(t => t.done).length
          const pct = dayTasks.length ? Math.round(doneCnt / dayTasks.length * 100) : 0
          const today = isToday(day)

          return (
            <div key={key} className={`${styles.dayCol} ${today ? styles.today : ''}`}>
              <div className={styles.dayHeader}>
                <span className={styles.dayName}>{DAY_LABELS[i]}</span>
                <span className={styles.dayNum}>{format(day, 'd')}</span>
                {dayTasks.length > 0 && (
                  <span className={styles.dayCount}>{doneCnt}/{dayTasks.length}</span>
                )}
              </div>
              {dayTasks.length > 0 && (
                <div className={styles.dayBar}>
                  <div className={styles.dayBarFill} style={{ width: `${pct}%` }} />
                </div>
              )}
              <div className={styles.taskList}>
                {dayTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onAssignDay={onAssignDay}
                  />
                ))}
              </div>
              <button className={styles.addDayBtn} onClick={() => onAdd(key)}>
                + tâche
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
