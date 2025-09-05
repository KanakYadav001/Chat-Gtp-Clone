import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css'; // Will use the same styles as Login
import Logo from '/src/assets/logo.svg'; // Import the logo

const Register = ({ onAuthSuccess }) => {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.post('/auth/register', {
        fullName: { firstName: first, lastName: last },
        email,
        password,
      });
      onAuthSuccess(data.user); // Update the user state in App.jsx
      nav('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src={Logo} alt="App Logo" className={styles.logo} />
          <h2 className={styles.title}>Create an account</h2>
          <p className={styles.subtitle}>Start your journey with us today.</p>
        </div>

        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>First Name</label>
              <input
                className={styles.input}
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                type="text"
                placeholder="First name"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
              <input
                className={styles.input}
                value={last}
                onChange={(e) => setLast(e.target.value)}
                type="text"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Choose a strong password"
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button disabled={loading} className={styles.btnPrimary}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;