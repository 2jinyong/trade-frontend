import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios, { API_URL } from "../api/axios";
import "../css/Login.css";

const Login = ({ isLogin, setIsLogin, setLoginUserId, setDisplayName }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  if (isLogin) return <Navigate to="/" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/login", { userId, password });
      setIsLogin(true);
      setLoginUserId(userId);
      setDisplayName(userId);
      navigate("/");
    } catch (err) {
      alert("로그인 실패");
    }
  };

  return (
    <div className="auth-container">
      {/* 로고 */}
      <div className="auth-logo" onClick={() => navigate("/")}>
        <div className="logo-icon">
          <i className="fa-solid fa-handshake-angle"></i>
        </div>
        <span>중고마켓</span>
      </div>

      {/* 로그인 박스 */}
      <div className="auth-box">
        <h1 className="auth-title">로그인</h1>
        <p className="auth-subtitle">중고마켓에서 안전한 거래를 시작해보세요</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <i className="fa-regular fa-user"></i>
            <input
              type="text"
              placeholder="아이디를 입력해주세요"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div className="input-group">
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-btn">
            로그인
          </button>
        </form>

        <div className="divider">
          <span>또는</span>
        </div>

        <div className="social-buttons">
          <button
            className="social-btn google"
            onClick={() => window.location.href = `${API_URL}/oauth2/authorization/google`}
          >
            <i className="fa-brands fa-google"></i>
            Google 계정으로 로그인
          </button>
          <button
            className="social-btn naver"
            onClick={() => window.location.href = `${API_URL}/oauth2/authorization/naver`}
          >
            <span className="naver-icon">N</span>
            네이버 계정으로 로그인
          </button>
        </div>

        <div className="auth-footer">
          <span>아직 계정이 없으신가요?</span>
          <Link to="/register">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
