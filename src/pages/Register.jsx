import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [match, setMatch] = useState(true);
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!match) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const userData = { userId, password, name, tel, email };

    try {
      const res = await axios.post('http://localhost:8081/api/register', userData);
      alert(res.data); // "회원가입 성공" 메시지
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data || '서버 오류!';
      alert(msg);
      console.error('회원가입 실패:', msg);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setMatch(value === rePassword);
  };

  const handleRePasswordChange = (e) => {
    const value = e.target.value;
    setRePassword(value);
    setMatch(value === password);
  };

  return (
    <div>
      <Link to="/"><h1>메인페이지</h1></Link>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="아이디"
          required
          maxLength={15}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="비밀번호 8~12자리"
          required
          minLength={8}
          maxLength={12}
          value={password}
          onChange={handlePasswordChange}
        /><br />
        <input
          type="password"
          placeholder="비밀번호 확인"
          required
          value={rePassword}
          onChange={handleRePasswordChange}
        /><br />
        <input
          type="text"
          placeholder="이름"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        /><br />
        <input
          type="tel"
          placeholder="전화번호"
          required
          value={tel}
          onChange={(e) => setTel(e.target.value)}
        /><br />
        <input
          type="email"
          placeholder="이메일주소"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <button type="submit">가입하기</button>
        {!match && (
          <p style={{ color: 'red' }}>비밀번호가 일치하지 않습니다.</p>
        )}
      </form>
    </div>
  );
};

export default Register;
