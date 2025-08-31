import React, {useEffect, useRef, useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import Logo from '../assets/logo.svg'
import styles from './Chat.module.css'

const Message = ({text, from='ai'}) => (
  <div className={`${styles.message} ${from=== 'ai' ? styles.ai : styles.user}`}>
    <div className={styles.avatar} aria-hidden />
    <div className={styles.bubble}>{text}</div>
  </div>
)

const Chat = () => {
  const [messages, setMessages] = useState([
    {id: 's1', from: 'ai', text: 'Hello! How can I assist you today?'}
  ])
  const [input, setInput] = useState('')
  const socketRef = useRef(null)
  const nav = useNavigate()

  useEffect(()=>{
    // connect to socket.io (dev proxy handles same origin)
    const s = io({ withCredentials: true })
    socketRef.current = s

    s.on('connect_error', (err)=> console.error('socket connect error', err))
    s.on('ai-response', (payload)=>{
      if(payload && payload.content){
        setMessages(prev => [...prev, {id: `r${Date.now()}`, from: 'ai', text: payload.content}])
      }
    })

    return ()=>{
      s.disconnect()
    }
  },[])

  function sendMessage(){
    if(!input.trim()) return
    const content = input.trim()
    const chatId = null // using null for now; backend can infer or you can create chats later
    setMessages(prev => [...prev, {id: `u${Date.now()}`, from: 'user', text: content}])
    setInput('')
    if(socketRef.current && socketRef.current.connected){
      socketRef.current.emit('ai-message',{chat: chatId, content})
    } else {
      // optimistic fallback: call simple API (not implemented) or show error
      setMessages(prev => [...prev, {id: `e${Date.now()}`, from: 'ai', text: 'Unable to reach server.'}])
    }
  }

  function onKeyDown(e){ if(e.key === 'Enter'){ e.preventDefault(); sendMessage() }}

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.leftGroup}>
          <img src={Logo} alt="AI logo" className={styles.logo} />
          <button className={styles.back} aria-label="back"></button>
        </div>

        <div className={styles.actions}>
          <Link to="/login" className={styles.authBtn}>Login</Link>
          <Link to="/register" className={styles.authBtnPrimary}>Sign up</Link>
        </div>
      </header>

      <main className={styles.messages}>
        {messages.map(m => (
          <Message key={m.id} text={m.text} from={m.from} />
        ))}
      </main>

      <div className={styles.inputRow}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKeyDown} className={styles.input} placeholder="Type your message..." />
        <button className={styles.attach} aria-label="attach">🖼️</button>
        <button onClick={sendMessage} className={styles.send} aria-label="send">➤</button>
      </div>
      <nav className={styles.bottomNav}>
        <Link to="/chat" className={styles.navItem}>💬<span>Chat</span></Link>
        <Link to="/history" className={styles.navItem}>🕘<span>History</span></Link>
        <Link to="/settings" className={styles.navItem}>⚙️<span>Settings</span></Link>
      </nav>
    </div>
  )
}

export default Chat
