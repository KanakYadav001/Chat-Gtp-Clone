import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Profile.module.css';
import api from '../api.js';

const Profile = ({ user, onAuthSuccess }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      onAuthSuccess(null); // Clear user state in App.jsx
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
      // Still attempt to clear client-side state
      onAuthSuccess(null);
      navigate('/login');
    }
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <p>You are not logged in. <Link to="/login">Login</Link></p>
      </div>
    );
  }

  const { Fullname, email } = user;
  const initial = Fullname.firstName.charAt(0);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link to="/" className={styles.backButton}>← Back to Chat</Link>
          <div className={styles.avatar}>
            <span>{initial}</span>
          </div>
          <h2 className={styles.fullName}>{Fullname.firstName} {Fullname.lastName}</h2>
          <p className={styles.email}>{email}</p>
        </div>
        
        <div className={styles.userInfo}>
            <div className={styles.infoItem}>
                <span className={styles.label}>First Name</span>
                <span className={styles.value}>{Fullname.firstName}</span>
            </div>
            <div className={styles.infoItem}>
                <span className={styles.label}>Last Name</span>
                <span className={styles.value}>{Fullname.lastName}</span>
            </div>
             <div className={styles.infoItem}>
                <span className={styles.label}>Email Address</span>
                <span className={styles.value}>{email}</span>
            </div>
        </div>

        <div className={styles.actions}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

