import React, {useState} from 'react'
import api from '../api'
import {useNavigate, Link} from 'react-router-dom'
import styles from './Register.module.css'

const Register = () => {
  const [first,setFirst] = useState('')
  const [last,setLast] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState(null)
  const nav = useNavigate()

  async function handleRegister(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      await api.post('/auth/register',{fullName:{firstName:first,lastName:last},email,password})
      nav('/login')
    }
    catch(err){
      setError(err.message || 'Register failed')
    }
    finally{setLoading(false)}
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create account</h2>
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>First name</label>
              <input className={styles.input} value={first} onChange={e=>setFirst(e.target.value)} type="text" placeholder="First name" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last name</label>
              <input className={styles.input} value={last} onChange={e=>setLast(e.target.value)} type="text" placeholder="Last name" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Choose a password" />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button disabled={loading} className={styles.btnPrimary}>{loading? 'Registering...':'Register'}</button>
            <Link to="/login" className={styles.btnSecondary}>Already have an account?</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
