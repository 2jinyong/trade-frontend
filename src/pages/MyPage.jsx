import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import "../css/MyPage.css";
import "../css/Home.css";

const MyPage = ({ loginUserId, displayName }) => {
  const [myPosts, setMyPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get("/api/posts");
        const filtered = res.data.filter(post => post.userId === loginUserId);
        setMyPosts(filtered);
      } catch (err) {
        console.log("내 게시글 불러오기 실패:", err);
      }
    };
    if (loginUserId) {
      fetchMyPosts();
    }
  }, [loginUserId]);

  function getThumbnail(content) {
    const match = content?.match(/<img[^>]*src="([^"]*)"/);
    return match ? match[1] : null;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }

  return (
    <Container className="mypage-wrap">
      <Button variant="outline-secondary" onClick={() => navigate("/")} className="back-btn">
        홈으로
      </Button>

      <div className="mypage-header">
        <h2>내 정보</h2>
      </div>

      <Card className="user-info-card">
        <Card.Body>
          <div className="user-info">
            <div className="user-avatar">
              {displayName?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h4>{displayName}</h4>
              <p>등록한 게시글: {myPosts.length}개</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <h4 className="mt-4 mb-3">내가 등록한 게시글</h4>

      {myPosts.length === 0 ? (
        <p className="no-posts">등록한 게시글이 없습니다.</p>
      ) : (
        <Row>
          {myPosts.map((post) => (
            <Col key={post.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card onClick={() => navigate(`/posts/${post.id}`)} className="home-card">
                <div className="card-img-box">
                  {getThumbnail(post.content) ? (
                    <Card.Img variant="top" src={getThumbnail(post.content)} />
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
                  <Card.Text className="views">조회수 {post.views} ❤️{post.likeCount}</Card.Text>
                  <Card.Text className="createAt">{formatDate(post.createdAt)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyPage;
