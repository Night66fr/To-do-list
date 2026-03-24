import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import WeekView from './components/WeekView'
import BacklogView from './components/BacklogView'
import TaskModal from './components/TaskModal'
import AuthForm from './components/AuthForm'
import styles from './App.module.css'

const TABS = [
  { id: 'week', label: 'Semaine' },
  { id: 'backlog', label: 'Backlog' },
]

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = chargement, null = déconnecté
  const [tab, setTab] = useState('week')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  // Surveiller la session auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchTasks = useCallback(async () => {
    if (!session) return
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) setTasks(data || [])
    setLoading(false)
  }, [session])

  useEffect(() => {
    if (!session) { setTasks([]); setLoading(false); return }
    setLoading(true)
    fetchTasks()
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchTasks, session])

  const addTask = async ({ text, category, dayDate }) => {
    const tempId = crypto.randomUUID()
    const optimistic = {
      id: tempId,
      text,
      category,
      day_date: dayDate || null,
      done: false,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      _pending: true,
    }

    // Affichage immédiat sans attendre Supabase
    setTasks(prev => [...prev, optimistic])
    setModal(null)

    const { data, error } = await supabase.from('tasks').insert({
      text,
      category,
      day_date: dayDate || null,
      done: false,
      user_id: session.user.id,
    }).select().single()

    if (error) {
      // Rollback si erreur
      setTasks(prev => prev.filter(t => t.id !== tempId))
    } else {
      // Remplacer l'entrée temporaire par la vraie (avec le vrai id Supabase)
      setTasks(prev => prev.map(t => t.id === tempId ? data : t))
    }
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Chargement initial
  if (session === undefined) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Chargement...</div>
  }

  // Non connecté → écran de login
  if (!session) {
    return <AuthForm />
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
        <div className={styles.headerRight}>
          <button className={styles.addBtn} onClick={() => setModal({})}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Nouvelle tâche
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Se déconnecter">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
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
