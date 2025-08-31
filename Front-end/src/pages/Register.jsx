import React, {useState} from 'react'
import api from '../api'
import {useNavigate} from 'react-router-dom'

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
    <div style={{padding:20,maxWidth:480,margin:'0 auto'}}>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label>First Name</label>
          <input value={first} onChange={e=>setFirst(e.target.value)} type="text" placeholder="First name" />
        </div>
        <div>
          <label>Last Name</label>
          <input value={last} onChange={e=>setLast(e.target.value)} type="text" placeholder="Last name" />
        </div>
        <div>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" />
        </div>
        <div>
          <label>Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Choose a password" />
        </div>
        {error && <div style={{color:'salmon',marginTop:8}}>{error}</div>}
        <button disabled={loading} style={{marginTop:12}}>{loading? 'Registering...':'Register'}</button>
      </form>
    </div>
  )
}

export default Register
