import {BrowserRouter,Routes,Route } from 'react-router-dom' ;
import React from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import History from "./pages/History";

const AppRouters = ({ theme, toggleTheme, user, onAuthSuccess }) => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Chat theme={theme} toggleTheme={toggleTheme} user={user} />}/>
            <Route path='/home' element={<Home/>}/>
            <Route path='/register' element={<Register onAuthSuccess={onAuthSuccess} />}/>
            <Route path='/login' element={<Login onAuthSuccess={onAuthSuccess} />}/>
            <Route path='/chat' element={<Chat theme={theme} toggleTheme={toggleTheme} user={user} />}/>
            <Route path='/history' element={<History/>}/>
            <Route path='/settings' element={<Settings/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default AppRouters