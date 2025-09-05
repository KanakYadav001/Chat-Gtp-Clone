import { useState, useEffect } from 'react'
import AppRouters from './AppRouters.jsx'
import './App.css';
import api from './api.js';

function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null); // To hold user data
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Check for an active session when the app loads
    const checkSession = async () => {
      try {
        const data = await api.get('/auth/me');
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.log("No active session or session expired.");
      } finally {
        setLoading(false); // Stop loading once the check is complete
      }
    };

    checkSession();
  }, []);


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // This function will be called on successful login/registration
  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return (
      <div className={`app-container ${theme}-theme`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

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
