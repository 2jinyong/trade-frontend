import React from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { useEffect,useState } from "react";

const Home = ({ isLogin, setIsLogin }) => {
  const [posts,setPosts] = useState([]);
  useEffect(()=> {
    // list();
  },[])

  const list = async () =>{
    try{
      await axios.get("api/posts");
      setPosts(Response.data);
    }catch(err){
      alert("상품목록 로딩실패");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout"); // ✅ 서버에서 쿠키 삭제
      setIsLogin(false);               // ✅ 상태 초기화
      alert("로그아웃 완료");
    } catch (err) {
      alert("로그아웃 실패");
    }
  };

  const create = () =>{
    <Link to={"/post/create"}></Link>
  }

  return (
    <div>
      <Link to="/"><h1>메인페이지</h1></Link>
      {isLogin && <button onClick={create}>글 등록하기</button>}
      {isLogin ? (
        <button onClick={handleLogout}>로그아웃</button>
      ) : (
        <Link to="/login">로그인</Link>
      )}
      <h1>상품목록</h1>
      
    </div>
  );
};

export default Home;
