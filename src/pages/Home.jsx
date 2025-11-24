import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Container, Button, Row, Col, Card } from "react-bootstrap";
import "../css/Home.css";

const Home = ({ isLogin, setIsLogin }) => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  function getThumbnail(content) {
  const match = content?.match(/<img[^>]*src="([^"]*)"/);
  return match ? match[1] : null;
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
      navigate("/");
    } catch (err) {
      alert("로그아웃 실패");
    }
  };

  return (
    <Container className="home-wrap">

      <div className="home-header">
        <h2>중고거래</h2>
        <div className="home-buttons">
          {isLogin && (
            <Button variant="success" onClick={() => navigate("/post/create")}>
              글쓰기
            </Button>
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
                  <div className="no-image">이미지 없음</div>
                )}
              </div>


              <Card.Body>
                <Card.Title className="card-title">{post.title}</Card.Title>
                <Card.Text className="price">{post.price}원</Card.Text>
                <Card.Text className="writer">{post.userId}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

    </Container>
  );
};

export default Home;
