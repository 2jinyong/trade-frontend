import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Container, Form, Button } from "react-bootstrap";

const Login = ({ isLogin, setIsLogin }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  if (isLogin) return <Navigate to="/" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/login", { userId, password });
      setIsLogin(true);
      navigate("/");
    } catch (err) {
      alert("로그인 실패");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4">로그인</h2>

      <Form onSubmit={handleLogin}>
        <Form.Control
          className="mb-3"
          type="text"
          placeholder="아이디"
          onChange={(e) => setUserId(e.target.value)}
        />

        <Form.Control
          className="mb-3"
          type="password"
          placeholder="비밀번호"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" variant="success" className="w-100">
          로그인
        </Button>
      </Form>

      <div className="mt-3">
        <Link to="/register">회원가입</Link>
      </div>
    </Container>
  );
};

export default Login;
