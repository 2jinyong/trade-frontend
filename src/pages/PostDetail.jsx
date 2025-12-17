import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import "../css/PostDetail.css";

export default function PostDetail({ loginUserId }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // content에서 모든 이미지 추출
  const getAllImages = (content) => {
    const regex = /<img[^>]*src="([^"]*)"/g;
    const images = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      images.push(match[1]);
    }
    return images;
  };

  // content에서 이미지 태그 제거 (본문용)
  const removeImages = (content) => {
    return content?.replace(/<img[^>]*>/g, "") || "";
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 소셜로그인 유저 아이디 포맷팅 (이메일 @ 뒷부분 제거)
  const formatDisplayName = (name) => {
    if (name && name.includes('@')) {
      return name.split('@')[0];
    }
    return name;
  };

  useEffect(() => {
    // 게시글 조회
    axios.get(`/api/posts/${id}`).then((res) => setPost(res.data));
    // 좋아요 상태 조회
    axios.get(`/api/likes/${id}`).then((res) => {
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    }).catch(() => {});
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/posts/${id}`);
      alert("삭제 완료");
      navigate("/");
    } catch (e) {
      alert(e.response?.data || "삭제 실패");
    }
  };

  // 좋아요 토글
  const handleLike = async () => {
    if (!loginUserId) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const res = await axios.post(`/api/likes/${id}`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (e) {
      alert("좋아요 실패");
    }
  };

  if (!post) return <div className="loading">로딩 중...</div>;

  return (
    <div className="detail-page">
      {/* 상단 네비게이션 */}
      <div className="detail-header">
        <div className="breadcrumb">
          <span onClick={() => navigate("/")} className="breadcrumb-link">홈</span>
          <span className="breadcrumb-separator">{">"}</span>
          <span className="breadcrumb-current">게시글</span>
        </div>
        <button className="back-btn" onClick={() => navigate("/")}>
          ← 목록으로
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="detail-content">
        {/* 좌측: 이미지 슬라이더 + 판매자 */}
        <div className="image-area">
          {(() => {
            const images = getAllImages(post.content);
            if (images.length > 0) {
              return (
                <div className="image-slider">
                  <img src={images[currentImageIndex]} alt={`상품 이미지 ${currentImageIndex + 1}`} className="main-image" />
                  {images.length > 1 && (
                    <>
                      <button
                        className="slider-btn slider-prev"
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                      >
                        ‹
                      </button>
                      <button
                        className="slider-btn slider-next"
                        onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                      >
                        ›
                      </button>
                      <div className="slider-dots">
                        {images.map((_, idx) => (
                          <span
                            key={idx}
                            className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(idx)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            } else {
              return (
                <div className="no-image-box">
                  <span className="no-image-icon">📷</span>
                  <span className="no-image-text">등록된 이미지가 없습니다</span>
                </div>
              );
            }
          })()}
          <div className="seller-info">
            <span className="seller-name">{formatDisplayName(post.userId)}</span>
          </div>
        </div>

        {/* 우측: 상품 정보 */}
        <div className="info-area">
          {/* 더보기 메뉴 */}
          {loginUserId === post.userId && (
            <div className="more-menu">
              <button className="more-btn" onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
              {menuOpen && (
                <div className="dropdown">
                  <button onClick={() => navigate(`/posts/edit/${id}`)}>수정</button>
                  <button onClick={handleDelete}>삭제</button>
                </div>
              )}
            </div>
          )}

          {/* 제목 */}
          <h1 className="product-title">{post.title}</h1>

          {/* 카테고리 · 등록일 */}
          <div className="product-meta">
            <span className="category">중고거래</span>
            <span className="dot">·</span>
            <span className="time">
              {post.updatedAt && post.updatedAt !== post.createdAt
                ? `${formatDate(post.updatedAt)} (수정됨)`
                : formatDate(post.createdAt)
              }
            </span>
          </div>

          {/* 가격 */}
          <div className="product-price">
            {Number(post.price).toLocaleString()}원
          </div>

          {/* 상품 설명 */}
          <div className="product-description" dangerouslySetInnerHTML={{ __html: removeImages(post.content) }} />

          {/* 좋아요 버튼 */}
          <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
            {liked ? "❤️" : "🤍"} 좋아요 {likeCount}
          </button>

          {/* 채팅 · 관심 · 조회 */}
          <div className="product-stats">
            <span>채팅 0</span>
            <span className="dot">·</span>
            <span>좋아요 {likeCount}</span>
            <span className="dot">·</span>
            <span>조회 {post.views}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
