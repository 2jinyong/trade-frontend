import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostCreate from "./pages/PostCreate";
import axios from "./api/axios";
import PostDetail from "./pages/PostDetail";
import PostEdit from "./pages/PostEdit";
import MyPage from "./pages/MyPage";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import Wallet from "./pages/Wallet";
import Charge from "./pages/Charge";
import ChargeSuccess from "./pages/ChargeSuccess";
import ChargeFail from "./pages/ChargeFail";
import Withdraw from "./pages/Withdraw";

function App() {
  const [isLogin, setIsLogin] = useState(null);
  const [loginUserId, setLoginUserId] = useState(() => {
    return localStorage.getItem("loginUserId") || null;
  });
  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem("displayName") || null;
  });

  // loginUserId가 변경될 때 localStorage에 저장
  useEffect(() => {
    if (loginUserId) {
      localStorage.setItem("loginUserId", loginUserId);
    } else {
      localStorage.removeItem("loginUserId");
    }
  }, [loginUserId]);

  // displayName이 변경될 때 localStorage에 저장
  useEffect(() => {
    if (displayName) {
      localStorage.setItem("displayName", displayName);
    } else {
      localStorage.removeItem("displayName");
    }
  }, [displayName]);

  useEffect(() => {
    axios
      .get("/api/auth/check")
      .then((res) => {
        setIsLogin(res.data.authenticated);
        if (res.data.userId) {
          setLoginUserId(res.data.userId);
          // 소셜 로그인: email의 @ 앞부분 사용, 일반 로그인: userId 사용
          const email = res.data.email;
          const name = email ? email.split('@')[0] : res.data.userId;
          setDisplayName(name);
        } else if (!res.data.authenticated) {
          setLoginUserId(null);
          setDisplayName(null);
        }
      })
      .catch(() => {
        setIsLogin(false);
        setLoginUserId(null);
        setDisplayName(null);
      });
  }, []);

  if (isLogin === null) {
    return <div style={{ padding: 40 }}>로딩 중...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home isLogin={isLogin} setIsLogin={setIsLogin} setLoginUserId={setLoginUserId} setDisplayName={setDisplayName} displayName={displayName} />} />

        <Route
          path="/login"
          element={
            isLogin ? <Navigate to="/" replace /> : <Login setIsLogin={setIsLogin} setLoginUserId={setLoginUserId} setDisplayName={setDisplayName} />
          }
        />

        <Route
          path="/register"
          element={isLogin ? <Navigate to="/" replace /> : <Register />}
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
        <Route
          path="/mypage"
          element={isLogin ? <MyPage loginUserId={loginUserId} displayName={displayName} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/chat"
          element={isLogin ? <ChatList loginUserId={loginUserId} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/chat/:roomId"
          element={isLogin ? <ChatRoom loginUserId={loginUserId} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/wallet"
          element={isLogin ? <Wallet loginUserId={loginUserId} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/wallet/charge"
          element={isLogin ? <Charge loginUserId={loginUserId} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/wallet/charge/success"
          element={isLogin ? <ChargeSuccess /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/wallet/charge/fail"
          element={isLogin ? <ChargeFail /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/wallet/withdraw"
          element={isLogin ? <Withdraw loginUserId={loginUserId} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
