import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  // 컴포넌트가 처음 렌더링될 때 localStorage에서 로그인 상태 읽어오기
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLogin") === "true";
    const storedUserId = localStorage.getItem("userId");

    setIsLogin(loginStatus);
    if (loginStatus && storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("userId");
    setIsLogin(false); // ✅ 상태 업데이트로 UI 즉시 반영
    setUserId('');
  };

  const account = () => {
    navigate('/account');
  }

  return (
    <div>
      <Link to="/"><h1>메인페이지</h1></Link>

      {isLogin ? (
        <>
          <h2>환영합니다, {userId }님!</h2>
          <button onClick={account}>내 정보 보러가기</button>
          <button onClick={logout}>로그아웃</button><br/>
          
        </>
      ) : (
        <>
          <Link to="/login">로그인</Link><br />
          <Link to="/register">회원가입</Link>
        </>
      )}
    </div>
  );
};

export default Home;
