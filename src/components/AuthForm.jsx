import { useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './AuthForm.module.css'

export default function AuthForm() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleSubmit = async () => {
    setError(null)
    setMessage(null)
    if (!email.trim() || !password.trim()) return
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email ou mot de passe incorrect.')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Compte créé ! Vérifie ton email pour confirmer.')
    }

    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>TaskFlow</div>
        <p className={styles.sub}>
          {mode === 'login' ? 'Connecte-toi pour accéder à tes tâches' : 'Crée ton compte TaskFlow'}
        </p>

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder="toi@exemple.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Mot de passe</label>
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        <button
          className={styles.btn}
          onClick={handleSubmit}
          disabled={loading || !email.trim() || !password.trim()}
        >
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
        </button>

        <div className={styles.switch}>
          {mode === 'login' ? (
            <>Pas encore de compte ?{' '}
              <button className={styles.switchBtn} onClick={() => { setMode('register'); setError(null) }}>
                S'inscrire
              </button>
            </>
          ) : (
            <>Déjà un compte ?{' '}
              <button className={styles.switchBtn} onClick={() => { setMode('login'); setError(null) }}>
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
