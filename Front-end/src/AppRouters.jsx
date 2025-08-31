import {BrowserRouter,Routes,Route } from 'react-router-dom' ;
import React from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import Settings from './pages/Settings'

const AppRouters = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Chat/>}/>
            <Route path='/home' element={<Home/>}/>
            <Route path='/register' element={<Register/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/chat' element={<Chat/>}/>
            <Route path='/history' element={<History/>}/>
            <Route path='/settings' element={<Settings/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default AppRouters
