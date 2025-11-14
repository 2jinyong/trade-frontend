import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const Login = ({ setIsLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { userId, password });
      alert(res.data); // "로그인 성공"
      setIsLogin(true); // ✅ 로그인 상태 true
      navigate("/");    // ✅ 메인페이지로 리디렉트
    } catch (err) {
      const msg = err.response?.data || '서버 오류!';
      alert(msg);
    }
  };

  return (
    <div>
      <Link to="/"><h1>메인페이지</h1></Link>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="아이디"
          required
          onChange={(e) => setUserId(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="비밀번호"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">로그인</button>
      </form>
      <Link to="/register">회원가입</Link>
    </div>
  );
};

export default Login;
