import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../css/Home.css";

const Home = ({ isLogin, setIsLogin, setLoginUserId, setDisplayName, displayName }) => {
  const [posts, setPosts] = useState([]);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [chatCount, setChatCount] = useState(0);
  const postsPerPage = 12;
  const navigate = useNavigate();

  // 공지사항 데이터
  const notices = [
    { icon: "fa-shield-halved", text: "직거래 시 ", highlight: "공공장소", suffix: "에서 만나세요!" },
    { icon: "fa-credit-card", text: "거래 전 ", highlight: "현금 선입금", suffix: "을 요구하면 사기입니다!" },
    { icon: "fa-user-check", text: "판매자의 ", highlight: "프로필과 거래후기", suffix: "를 확인하세요!" },
    { icon: "fa-comments", text: "거래는 ", highlight: "채팅", suffix: "으로 안전하게!" },
    { icon: "fa-triangle-exclamation", text: "너무 싼 가격은 ", highlight: "사기", suffix: "일 수 있어요!" },
  ];

  function getThumbnail(content) {
    const match = content?.match(/<img[^>]*src="([^"]*)"/);
    return match ? match[1] : null;
  }

  // 상대적 시간 표시
  function getRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
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

  // 채팅 개수 가져오기
  useEffect(() => {
    if (!isLogin) return;
    const fetchChatCount = async () => {
      try {
        const res = await axios.get("/api/chat/rooms");
        setChatCount(res.data.length);
      } catch (err) {
        // 조용히 실패
      }
    };
    fetchChatCount();
  }, [isLogin]);

  // 공지사항 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setNoticeIndex((prev) => (prev + 1) % notices.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [notices.length]);

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

  // 소셜로그인 유저 아이디 포맷팅
  const formatDisplayName = (name) => {
    if (name && name.includes('@')) {
      return name.split('@')[0];
    }
    return name;
  };

  // 페이징 계산
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <div className="home-container">
      {/* 상단 네비게이션 바 */}
      <nav className="top-nav">
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => navigate("/")}>
            <div className="logo-icon">
              <i className="fa-solid fa-handshake-angle"></i>
            </div>
            <span>중고마켓</span>
          </div>

          <div className="nav-actions">
            {isLogin ? (
              <>
                <button className="nav-btn chat-btn" onClick={() => navigate("/chat")}>
                  <i className="fa-regular fa-comment-dots"></i>
                  {chatCount > 0 && <span className="chat-badge">{chatCount}</span>}
                </button>
                <button className="nav-btn" onClick={() => navigate("/mypage")}>
                  <i className="fa-regular fa-user"></i>
                </button>
                <button className="nav-btn-text" onClick={handleLogout}>
                  로그아웃
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-btn-text primary">
                로그인
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        {/* 환영 메시지 & 글쓰기 */}
        {isLogin && (
          <div className="welcome-section">
            <div className="welcome-text">
              <span className="greeting">반가워요, </span>
              <span className="username">{formatDisplayName(displayName)}</span>
              <span className="greeting">님!</span>
            </div>
            <button className="write-btn" onClick={() => navigate("/post/create")}>
              <i className="fa-solid fa-plus"></i>
              <span>판매하기</span>
            </button>
          </div>
        )}

        {/* 안전거래 팁 배너 */}
        <div className="notice-banner">
          <div className="notice-content">
            {notices.map((notice, index) => (
              <div key={index} className={`notice-item ${index === noticeIndex ? 'active' : ''}`}>
                <i className={`fa-solid ${notice.icon}`}></i>
                <p>
                  {notice.text}
                  <strong>{notice.highlight}</strong>
                  {notice.suffix}
                </p>
              </div>
            ))}
          </div>
          <div className="notice-indicators">
            {notices.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === noticeIndex ? 'active' : ''}`}
                onClick={() => setNoticeIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* 상품 섹션 */}
        <section className="products-section">
          <div className="section-header">
            <h2>
              <i className="fa-solid fa-clock"></i>
              최근 등록된 글
            </h2>
            <span className="item-count">총 {posts.length}개</span>
          </div>

          {/* 상품 리스트 */}
          <div className="products-grid">
            {currentPosts.map((post) => (
              <article key={post.id} className="product-card" onClick={() => navigate(`/posts/${post.id}`)}>
                <div className="product-image">
                  {getThumbnail(post.content) ? (
                    <img src={getThumbnail(post.content)} alt={post.title} />
                  ) : (
                    <div className="no-image">
                      <i className="fa-regular fa-image"></i>
                    </div>
                  )}
                  {post.likeCount > 0 && (
                    <span className="like-badge">
                      <i className="fa-solid fa-heart"></i> {post.likeCount}
                    </span>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{post.title}</h3>
                  <p className="product-price">{Number(post.price).toLocaleString()}원</p>
                  <div className="product-meta">
                    <span className="time">{getRelativeTime(post.createdAt)}</span>
                  </div>
                  <div className="product-stats">
                    <span className="stat">
                      <i className="fa-regular fa-eye"></i> {post.views || 0}
                    </span>
                    <span className="stat">
                      <i className="fa-regular fa-heart"></i> {post.likeCount || 0}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="empty-state">
              <i className="fa-regular fa-folder-open"></i>
              <p>아직 등록된 상품이 없어요</p>
              {isLogin && (
                <button className="empty-write-btn" onClick={() => navigate("/post/create")}>
                  첫 상품 등록하기
                </button>
              )}
            </div>
          )}

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <i className="fa-solid fa-angles-left"></i>
              </button>
              <button
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              {getPageNumbers().map(number => (
                <button
                  key={number}
                  className={`page-btn ${currentPage === number ? 'active' : ''}`}
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </button>
              ))}

              <button
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
              <button
                className="page-btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <i className="fa-solid fa-angles-right"></i>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* 모바일 하단 네비게이션 */}
      <nav className="bottom-nav">
        <button className="bottom-nav-item active">
          <i className="fa-solid fa-house"></i>
          <span>홈</span>
        </button>
        <button className="bottom-nav-item" onClick={() => navigate("/chat")}>
          <div className="nav-icon-wrap">
            <i className="fa-regular fa-comment-dots"></i>
            {chatCount > 0 && <span className="chat-badge-bottom">{chatCount}</span>}
          </div>
          <span>채팅</span>
        </button>
        <button className="bottom-nav-item write" onClick={() => navigate("/post/create")}>
          <i className="fa-solid fa-plus"></i>
        </button>
        <button className="bottom-nav-item" onClick={() => navigate("/mypage")}>
          <i className="fa-regular fa-user"></i>
          <span>마이</span>
        </button>
      </nav>
    </div>
  );
};

export default Home;
