import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Container, Form, Button } from "react-bootstrap";
import "../css/Register.css";

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
    <Container className="register-container">
      <h2 className="register-title">회원가입</h2>

      <Form onSubmit={handleRegister} className="register-form">
        <Form.Control placeholder="아이디" onChange={(e) => setUserId(e.target.value)} />
        <Form.Control type="password" placeholder="비밀번호" onChange={(e) => setPassword(e.target.value)} />
        <Form.Control type="password" placeholder="비밀번호 확인" onChange={(e) => setRePassword(e.target.value)} />
        <Form.Control placeholder="이름" onChange={(e) => setName(e.target.value)} />
        <Form.Control placeholder="전화번호" onChange={(e) => setTel(e.target.value)} />
        <Form.Control type="email" placeholder="이메일" onChange={(e) => setEmail(e.target.value)} />

        <Button type="submit" variant="success" className="register-btn">가입하기</Button>
      </Form>

      <div className="register-link">
        <Link to="/">메인으로</Link>
      </div>
    </Container>
  );
};

export default Register;
