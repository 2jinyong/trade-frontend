import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Container, Form, Button } from "react-bootstrap";
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
      setDisplayName(userId);  // 일반 로그인: userId를 표시
      navigate("/");
    } catch (err) {
      alert("로그인 실패");
    }
  };

  return (
    <Container className="login-container">
      <h2 className="login-title">로그인</h2>

      <Form onSubmit={handleLogin} className="login-form">
        <Form.Control
          type="text"
          placeholder="아이디"
          onChange={(e) => setUserId(e.target.value)}
        />

        <Form.Control
          type="password"
          placeholder="비밀번호"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" variant="success" className="login-btn">
          로그인
        </Button>
      </Form>

      <div className="social-divider">
        <span>또는</span>
      </div>

      <div className="social-login">
        <button
          className="social-btn google-btn"
          onClick={() => window.location.href = 'http://localhost:8081/oauth2/authorization/google'}
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" />
          Google로 로그인
        </button>
        <button
          className="social-btn naver-btn"
          onClick={() => window.location.href = 'http://localhost:8081/oauth2/authorization/naver'}
        >
          <img src="https://www.naver.com/favicon.ico" alt="Naver" />
          네이버로 로그인
        </button>
      </div>

      <div className="login-link">
        <Link to="/register">회원가입</Link>
      </div>
    </Container>
  );
};

export default Login;
