import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, replace } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import PostCreate from "./pages/PostCreate";
import axios from "./api/axios";
import PostDetail from "./pages/PostDetail";
import PostEdit from "./pages/PostEdit";

function App() {
  const [isLogin, setIsLogin] = useState(null);
  const [loginUserId, setLoginUserId] = useState(() => {
    return localStorage.getItem("loginUserId") || null;
  });

  // loginUserId가 변경될 때 localStorage에 저장
  useEffect(() => {
    if (loginUserId) {
      localStorage.setItem("loginUserId", loginUserId);
    } else {
      localStorage.removeItem("loginUserId");
    }
  }, [loginUserId]);

  useEffect(() => {
    axios
      .get("/api/auth/check")
      .then((res) => {
        setIsLogin(res.data.authenticated);
        if (res.data.userId) {
          setLoginUserId(res.data.userId);
        } else if (!res.data.authenticated) {
          setLoginUserId(null);
        }
      })
      .catch(() => {
        setIsLogin(false);
        setLoginUserId(null);
      });
  }, []);

  if (isLogin === null) {
    return <div style={{ padding: 40 }}>로딩 중...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home isLogin={isLogin} setIsLogin={setIsLogin} setLoginUserId={setLoginUserId} />} />

        <Route
          path="/login"
          element={
            isLogin ? <Navigate to="/" replace /> : <Login setIsLogin={setIsLogin} setLoginUserId={setLoginUserId} />
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
          element={isLogin ? <PostDetail loginUserId={loginUserId} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/posts/edit/:id"
          element={isLogin ? <PostEdit loginUserId={loginUserId} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
