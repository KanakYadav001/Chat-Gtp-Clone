import {BrowserRouter,Routes,Route } from 'react-router-dom' ;
import React from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import Profile from './pages/Profile';

const AppRouters = ({ theme, toggleTheme, user, onAuthSuccess }) => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Chat theme={theme} toggleTheme={toggleTheme} user={user} onAuthSuccess={onAuthSuccess} />}/>
            <Route path='/home' element={<Home/>}/>
            <Route path='/register' element={<Register onAuthSuccess={onAuthSuccess} />}/>
            <Route path='/login' element={<Login onAuthSuccess={onAuthSuccess} />}/>
            <Route path='/chat' element={<Chat theme={theme} toggleTheme={toggleTheme} user={user} onAuthSuccess={onAuthSuccess} />}/>
            <Route path='/settings' element={<Settings/>}/>
            <Route path='/profile' element={<Profile user={user} onAuthSuccess={onAuthSuccess} />}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default AppRouters

