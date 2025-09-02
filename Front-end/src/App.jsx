import { useState } from 'react'
import AppRouters from './AppRouters.jsx'
import './App.css';

function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`app-container ${theme}-theme`}>
      <AppRouters theme={theme} toggleTheme={toggleTheme} />
    </div>
  )
}

export default App