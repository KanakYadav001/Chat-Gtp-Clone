import { useState, useEffect } from 'react'
import AppRouters from './AppRouters.jsx'
import './App.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null); // To hold user data

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // This function will be called on successful login/registration
  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  return (
    <div className={`app-container ${theme}-theme`}>
      <AppRouters
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default App