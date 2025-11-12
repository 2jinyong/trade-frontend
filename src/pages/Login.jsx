import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = { userId, password };

    try {
      const res = await axios.post('http://localhost:8081/api/login', loginData);
      alert('로그인 성공!');
      localStorage.setItem("isLogin","true");
      localStorage.setItem("userId", userId);
      console.log('서버 응답:', res.data); // JWT 토큰 또는 메시지
      navigate("/");
    } catch (err) {
      const msg = err.response?.data || '서버 오류!';
      alert(msg);
      console.error('로그인 실패:', msg);
    }
  };

  return (
    <div>
      <Link to="/"><h1>메인페이지</h1></Link>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="아이디를 입력하세요"
          required
          onChange={(e) => setUserId(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
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
