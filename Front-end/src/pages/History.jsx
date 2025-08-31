import React from 'react'
import styles from './History.module.css'

const HistoryItem = ({title, snippet, time}) => (
  <div className={styles.item} role="listitem">
    <div className={styles.icon} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>

    <div className={styles.meta}>
      <div className={styles.title}>{title}</div>
      <div className={styles.snippet}>{snippet}</div>
    </div>

    <div className={styles.time}>{time}</div>
  </div>
)

const Section = ({label, items}) => (
  <section className={styles.section}>
    <div className={styles.sectionTitle}>{label}</div>
    <div role="list" className={styles.list}>
      {items.map((it, i) => (
        <HistoryItem key={i} {...it} />
      ))}
    </div>
  </section>
)

const History = () => {
  const today = [
    {title: 'AI Chat with Sarah', snippet: 'The future of renewable energy sources...', time: '10:30 AM'},
  ]
  const yesterday = [
    {title: 'AI Chat with Alex', snippet: "Tips for learning a new programming language.", time: 'Yesterday'},
    {title: 'AI Chat with Emily', snippet: 'Exploring the history of ancient civilizations.', time: 'Yesterday'},
  ]
  const week = [
    {title: 'AI Chat with David', snippet: 'Best practices for sustainable living.', time: '2 days ago'},
    {title: 'AI Chat with Jessica', snippet: 'How to build a personal brand online.', time: '4 days ago'},
  ]

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.back} aria-label="back">←</button>
        <h1>History</h1>
      </header>

      <main className={styles.content}>
        <Section label="Today" items={today} />
        <Section label="Yesterday" items={yesterday} />
        <Section label="Previous 7 Days" items={week} />
      </main>

      <nav className={styles.bottomNav}>
        <div className={styles.navItem}>💬<span>Chat</span></div>
        <div className={`${styles.navItem} ${styles.active}`}>🕘<span>History</span></div>
        <div className={styles.navItem}>⚙️<span>Settings</span></div>
      </nav>
    </div>
  )
}

export default History
