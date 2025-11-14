import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';

const App = () => {
  const [isLogin, setIsLogin] = useState(false); // ✅ 로그인 상태 관리

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home isLogin={isLogin} setIsLogin={setIsLogin} />} />
        <Route path='/login' element={<Login setIsLogin={setIsLogin} />} />
        <Route path='/register' element={<Register />} />
        <Route path='/account' element={<Account />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
