import React, {useState} from 'react'
import api from '../api'
import {useNavigate, Link} from 'react-router-dom'
import styles from './Login.module.css'

const Login = () => {
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState(null)
  const nav = useNavigate()

  async function handleLogin(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      await api.post('/auth/login',{email,password})
      nav('/')
    }
    catch(err){
      setError(err.message || 'Login failed')
    }
    finally{setLoading(false)}
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Welcome back</h2>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button disabled={loading} className={styles.btnPrimary}>{loading? 'Logging...':'Login'}</button>
          </div>
        </form>

        <div className={styles.footer}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  )
}

export default Login