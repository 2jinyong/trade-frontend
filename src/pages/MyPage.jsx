import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../css/MyPage.css";

const MyPage = ({ loginUserId, displayName }) => {
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("myPosts");
  const navigate = useNavigate();

  // 유저 ID 비교 (소셜 로그인 고려)
  const isSameUser = (userId1, userId2) => {
    if (!userId1 || !userId2) return false;
    const format = (name) => name && name.includes('@') ? name.split('@')[0] : name;
    return userId1 === userId2 || format(userId1) === format(userId2);
  };

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get("/api/posts");
        const filtered = res.data.filter(post => isSameUser(post.userId, loginUserId));
        setMyPosts(filtered);
      } catch (err) {
        console.log("내 게시글 불러오기 실패:", err);
      }
    };

    const fetchLikedPosts = async () => {
      try {
        const res = await axios.get("/api/likes/my");
        setLikedPosts(res.data);
      } catch (err) {
        console.log("관심 상품 불러오기 실패:", err);
      }
    };

    const fetchWallet = async () => {
      try {
        const res = await axios.get("/api/wallet");
        setWallet(res.data);
      } catch (err) {
        // 지갑 조회 실패 - 조용히 처리
      }
    };

    if (loginUserId) {
      fetchMyPosts();
      fetchLikedPosts();
      fetchWallet();
    }
  }, [loginUserId]);

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

  // 소셜로그인 유저 아이디 포맷팅
  const formatDisplayName = (name) => {
    if (name && name.includes('@')) {
      return name.split('@')[0];
    }
    return name;
  };

  return (
    <div className="mypage-container">
      {/* 상단 네비게이션 */}
      <nav className="mypage-nav">
        <div className="nav-inner">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="nav-logo" onClick={() => navigate("/")}>
            <div className="logo-icon">
              <i className="fa-solid fa-handshake-angle"></i>
            </div>
            <span>중고마켓</span>
          </div>
          <div className="nav-right"></div>
        </div>
      </nav>

      {/* 프로필 섹션 */}
      <div className="profile-section">
        <div className="profile-card">
          <div className="profile-avatar">
            {formatDisplayName(displayName)?.charAt(0)?.toUpperCase()}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{formatDisplayName(displayName)}</h2>
            <p className="profile-id">@{loginUserId}</p>
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{myPosts.length}</span>
              <span className="stat-label">판매상품</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">
                {myPosts.reduce((sum, post) => sum + (post.likeCount || 0), 0)}
              </span>
              <span className="stat-label">받은 관심</span>
            </div>
          </div>
        </div>
      </div>

      {/* 지갑 카드 */}
      <div className="wallet-card" onClick={() => navigate("/wallet")}>
        <div className="wallet-left">
          <div className="wallet-icon">
            <i className="fa-solid fa-wallet"></i>
          </div>
          <div className="wallet-info">
            <span className="wallet-label">내 지갑</span>
            <span className="wallet-balance">
              {wallet ? Number(wallet.balance).toLocaleString() : "0"}원
            </span>
          </div>
        </div>
        <div className="wallet-actions">
          <button className="wallet-btn" onClick={(e) => { e.stopPropagation(); navigate("/wallet/charge"); }}>
            <i className="fa-solid fa-plus"></i>
            충전
          </button>
          <i className="fa-solid fa-chevron-right wallet-arrow"></i>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'myPosts' ? 'active' : ''}`}
          onClick={() => setActiveTab('myPosts')}
        >
          <i className="fa-solid fa-store"></i>
          판매상품
        </button>
        <button
          className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          <i className="fa-regular fa-heart"></i>
          관심목록
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <main className="mypage-content">
        {activeTab === 'myPosts' && (
          <>
            <div className="section-header">
              <h3>
                <i className="fa-solid fa-box"></i>
                내 판매상품
              </h3>
              <span className="item-count">{myPosts.length}개</span>
            </div>

            {myPosts.length === 0 ? (
              <div className="empty-state">
                <i className="fa-regular fa-folder-open"></i>
                <p>등록한 상품이 없어요</p>
                <button className="empty-btn" onClick={() => navigate("/post/create")}>
                  첫 상품 등록하기
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {myPosts.map((post) => (
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
                        <span className="views">
                          <i className="fa-regular fa-eye"></i> {post.views}
                        </span>
                        <span className="dot">·</span>
                        <span className="time">{getRelativeTime(post.createdAt)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'liked' && (
          <>
            <div className="section-header">
              <h3>
                <i className="fa-regular fa-heart"></i>
                관심 목록
              </h3>
              <span className="item-count">{likedPosts.length}개</span>
            </div>

            {likedPosts.length === 0 ? (
              <div className="empty-state">
                <i className="fa-regular fa-heart"></i>
                <p>아직 관심 상품이 없어요</p>
                <button className="empty-btn" onClick={() => navigate("/")}>
                  상품 둘러보기
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {likedPosts.map((post) => (
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
                        <span className="views">
                          <i className="fa-regular fa-eye"></i> {post.views}
                        </span>
                        <span className="dot">·</span>
                        <span className="time">{getRelativeTime(post.createdAt)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* 모바일 하단 네비게이션 */}
      <nav className="bottom-nav">
        <button className="bottom-nav-item" onClick={() => navigate("/")}>
          <i className="fa-solid fa-house"></i>
          <span>홈</span>
        </button>
        <button className="bottom-nav-item" onClick={() => navigate("/chat")}>
          <i className="fa-regular fa-comment-dots"></i>
          <span>채팅</span>
        </button>
        <button className="bottom-nav-item write" onClick={() => navigate("/post/create")}>
          <i className="fa-solid fa-plus"></i>
        </button>
        <button className="bottom-nav-item active">
          <i className="fa-solid fa-user"></i>
          <span>마이</span>
        </button>
      </nav>
    </div>
  );
};

export default MyPage;
