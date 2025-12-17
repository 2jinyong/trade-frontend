import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Container, Button, Row, Col, Card } from "react-bootstrap";
import "../css/Home.css";

const Home = ({ isLogin, setIsLogin, setLoginUserId, setDisplayName, displayName }) => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  function getThumbnail(content) {
    const match = content?.match(/<img[^>]*src="([^"]*)"/);
    return match ? match[1] : null;
  }

  // 날짜 포맷팅 함수
  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/api/posts");
        setPosts(res.data);
      } catch (err) {
        console.log("게시글 불러오기 실패:", err);
      }
    };
    fetchPosts();

  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
      setIsLogin(false);
      setLoginUserId(null);
      setDisplayName(null);
      navigate("/");
    } catch (err) {
      alert("로그아웃 실패");
    }
  };

  // 소셜로그인 유저 아이디 포맷팅 (이메일 @ 뒷부분 제거)
  const formatDisplayName = (name) => {
    if (name && name.includes('@')) {
      return name.split('@')[0];
    }
    return name;
  };
  return (
    <Container className="home-wrap">

      <div className="home-header">
        <h2>중고거래</h2>
        <div className="home-buttons">
          {isLogin && (
            <>
              <span className="welcome-msg">{formatDisplayName(displayName)}님 환영합니다</span>
              <Button variant="outline-primary" onClick={() => navigate("/mypage")}>
                내 정보
              </Button>
              <Button variant="success" onClick={() => navigate("/post/create")}>
                글쓰기
              </Button>
            </>
          )}

          {isLogin ? (
            <Button variant="outline-secondary" onClick={handleLogout}>
              로그아웃
            </Button>
          ) : (
            <Link to="/login" className="btn btn-outline-secondary">
              로그인
            </Link>
          )}
        </div>
      </div>

      <h3 className="mt-5 mb-4">최근 등록된 글</h3>

      <Row>
        {posts.map((post) => (
          <Col key={post.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card onClick={() => navigate(`/posts/${post.id}`)} className="home-card">  

              <div className="card-img-box">
                {getThumbnail(post.content) ? (
                  <Card.Img
                    variant="top"
                    src={getThumbnail(post.content)}
                  />
                ) : (
                  <div className="no-image">
                    <span className="no-image-icon">📷</span>
                    <span className="no-image-text">등록된 이미지가 없습니다</span>
                  </div>
                )}
              </div>


              <Card.Body>
                <Card.Title className="card-title">{post.title}</Card.Title>
                <Card.Text className="price">{Number(post.price).toLocaleString()}원</Card.Text>
                <Card.Text className="writer">{formatDisplayName(post.userId)}</Card.Text>
                <Card.Text className="views">조회수 {post.views} ❤️좋아요 {post.likeCount}</Card.Text>
                <Card.Text className="createAt">{formatDate(post.createdAt)}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

    </Container>
  );
};

export default Home;
