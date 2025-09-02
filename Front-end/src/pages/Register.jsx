import React, {useState} from 'react'
import api from '../api'
import {useNavigate, Link} from 'react-router-dom'
import styles from './Register.module.css' // Using CSS module

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
      nav('/')
    }
    catch(err){
      setError(err.message || 'Register failed')
    }
    finally{setLoading(false)}
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create an account</h2>
        </div>

        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>First Name</label>
              <input className={styles.input} value={first} onChange={e=>setFirst(e.target.value)} type="text" placeholder="First name" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
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
          </div>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default Register