import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, replace } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import PostCreate from "./pages/PostCreate";
import axios from "./api/axios";
import PostDetail from "./pages/PostDetail";

function App() {
  const [isLogin, setIsLogin] = useState(null);

  useEffect(() => {
    axios
      .get("/api/auth/check")
      .then((res) => setIsLogin(res.data.authenticated))
      .catch(() => setIsLogin(false));
  }, []);

  if (isLogin === null) {
    return <div style={{ padding: 40 }}>로딩 중...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home isLogin={isLogin} setIsLogin={setIsLogin} />} />

        <Route
          path="/login"
          element={
            isLogin ? <Navigate to="/" replace /> : <Login setIsLogin={setIsLogin} />
          }
        />

        <Route
          path="/register"
          element={isLogin ? <Navigate to="/" replace /> : <Register />}
        />

        <Route
          path="/account"
          element={isLogin ? <Account /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/post/create"
          element={isLogin ? <PostCreate isLogin={isLogin} /> : <Navigate to="/login" replace />}
        />
        <Route 
        path="/posts/:id" 
        element={isLogin ? <PostDetail isLogin={isLogin} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
