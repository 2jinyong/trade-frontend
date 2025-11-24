import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Container, Form, Button } from "react-bootstrap";

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
    <Container className="mt-5" style={{ maxWidth: "450px" }}>
      <h2 className="mb-4">회원가입</h2>

      <Form onSubmit={handleRegister}>
        <Form.Control className="mb-3" placeholder="아이디" onChange={(e)=>setUserId(e.target.value)} />
        <Form.Control className="mb-3" type="password" placeholder="비밀번호" onChange={(e)=>setPassword(e.target.value)} />
        <Form.Control className="mb-3" type="password" placeholder="비밀번호 확인" onChange={(e)=>setRePassword(e.target.value)} />
        <Form.Control className="mb-3" placeholder="이름" onChange={(e)=>setName(e.target.value)} />
        <Form.Control className="mb-3" placeholder="전화번호" onChange={(e)=>setTel(e.target.value)} />
        <Form.Control className="mb-3" type="email" placeholder="이메일" onChange={(e)=>setEmail(e.target.value)} />

        <Button type="submit" variant="success" className="w-100">가입하기</Button>
      </Form>

      <div className="mt-3">
        <Link to="/">메인으로</Link>
      </div>
    </Container>
  );
};

export default Register;
