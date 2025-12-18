import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../css/Login.css";

const Register = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== rePassword) {
      return alert("비밀번호가 일치하지 않습니다.");
    }

    const data = { userId, password, name, tel, email };

    try {
      await axios.post("/api/register", data);
      alert("회원가입 성공");
      navigate("/login");
    } catch (err) {
      alert("회원가입 실패");
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

      {/* 회원가입 박스 */}
      <div className="auth-box">
        <h1 className="auth-title">회원가입</h1>
        <p className="auth-subtitle">중고마켓의 새로운 회원이 되어주세요</p>

        <form onSubmit={handleRegister} className="auth-form">
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

          <div className="input-group">
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <i className="fa-solid fa-signature"></i>
            <input
              type="text"
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <i className="fa-solid fa-phone"></i>
            <input
              type="tel"
              placeholder="전화번호를 입력해주세요"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
            />
          </div>

          <div className="input-group">
            <i className="fa-regular fa-envelope"></i>
            <input
              type="email"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-btn">
            가입하기
          </button>
        </form>

        <div className="auth-footer">
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
