import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import WeekView from './components/WeekView'
import BacklogView from './components/BacklogView'
import TaskModal from './components/TaskModal'
import styles from './App.module.css'

const TABS = [
  { id: 'week', label: 'Semaine' },
  { id: 'backlog', label: 'Backlog' },
]

export default function App() {
  const [tab, setTab] = useState('week')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | { dayDate?: string }

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) setTasks(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchTasks])

  const addTask = async ({ text, category, dayDate }) => {
    await supabase.from('tasks').insert({
      text,
      category,
      day_date: dayDate || null,
      done: false,
    })
    setModal(null)
  }

  const toggleTask = async (id, done) => {
    await supabase.from('tasks').update({ done: !done }).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !done } : t))
  }

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const assignDay = async (id, dayDate) => {
    await supabase.from('tasks').update({ day_date: dayDate }).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, day_date: dayDate } : t))
  }

  const total = tasks.length
  const done = tasks.filter(t => t.done).length

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>TaskFlow</span>
          <div className={styles.globalStats}>
            <span>{done}/{total} fait</span>
            {total > 0 && (
              <div className={styles.miniBar}>
                <div className={styles.miniBarFill} style={{ width: `${Math.round(done/total*100)}%` }} />
              </div>
            )}
          </div>
        </div>
        <nav className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <button className={styles.addBtn} onClick={() => setModal({})}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Nouvelle tâche
        </button>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : tab === 'week' ? (
          <WeekView
            tasks={tasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onAdd={(dayDate) => setModal({ dayDate })}
            onAssignDay={assignDay}
          />
        ) : (
          <BacklogView
            tasks={tasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onAdd={() => setModal({})}
            onAssignDay={assignDay}
          />
        )}
      </main>

      {modal && (
        <TaskModal
          defaultDay={modal.dayDate}
          onClose={() => setModal(null)}
          onAdd={addTask}
        />
      )}
    </div>
  )
}
