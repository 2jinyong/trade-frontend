import React, { useEffect, useState, useRef } from "react";
import axios from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import "../css/PostDetail.css";

export default function PostDetail({ loginUserId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [post, setPost] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    // setTimeout으로 다음 이벤트 루프에서 리스너 등록
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

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

  // 상대적 시간 표시
  const getRelativeTime = (dateString) => {
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
  };

  // 소셜로그인 유저 아이디 포맷팅
  const formatDisplayName = (name) => {
    if (name && name.includes('@')) {
      return name.split('@')[0];
    }
    return name;
  };

  // 유저 ID 비교 (소셜 로그인 고려)
  const isSameUser = (userId1, userId2) => {
    if (!userId1 || !userId2) return false;
    // 정확한 비교를 위해 trim 및 소문자 변환
    const id1 = String(userId1).trim().toLowerCase();
    const id2 = String(userId2).trim().toLowerCase();
    if (id1 === id2) return true;
    // @ 앞부분만 비교 (소셜 로그인 대응)
    const format = (name) => name.includes('@') ? name.split('@')[0] : name;
    return format(id1) === format(id2);
  };

  // 댓글 목록 조회
  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/comments/${id}`);
      setComments(res.data);
    } catch (err) {
      console.log("댓글 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    axios.get(`/api/posts/${id}`).then((res) => setPost(res.data));
    axios.get(`/api/likes/${id}`).then((res) => {
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    }).catch(() => {});
    fetchComments();
  }, [id]);

  // 댓글 작성
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(`/api/comments/${id}`, { content: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      alert("댓글 작성 실패");
    }
  };

  // 댓글 수정
  const handleCommentUpdate = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      await axios.put(`/api/comments/${commentId}`, { content: editContent });
      setEditingCommentId(null);
      setEditContent("");
      fetchComments();
    } catch (err) {
      alert("댓글 수정 실패");
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      alert("댓글 삭제 실패");
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  // 1:1 채팅 시작
  const handleStartChat = async (partnerUserId) => {
    try {
      const res = await axios.post("/api/chat/room", { partnerUserId });
      navigate(`/chat/${res.data.roomId}`);
    } catch (err) {
      alert("채팅방 생성 실패");
    }
  };

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

  if (!post) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  const images = getAllImages(post.content);

  const isOwner = isSameUser(loginUserId, post.userId);

  return (
    <div className="detail-container">
      {/* 상단 네비게이션 */}
      <nav className="detail-nav">
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
          <div className="nav-right">
            {isOwner && (
              <div className="more-menu" ref={menuRef}>
                <button className="more-btn" onClick={() => setMenuOpen(prev => !prev)}>
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
                <div className={`dropdown-menu ${menuOpen ? 'show' : ''}`}>
                  <button onClick={() => { setMenuOpen(false); navigate(`/posts/edit/${id}`); }}>
                    <i className="fa-solid fa-pen"></i>
                    수정하기
                  </button>
                  <button className="delete" onClick={() => { setMenuOpen(false); handleDelete(); }}>
                    <i className="fa-solid fa-trash"></i>
                    삭제하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="detail-main">
        <div className="detail-content">
          {/* 이미지 섹션 */}
          <div className="image-section">
            {images.length > 0 ? (
              <div className="image-slider">
                <img
                  src={images[currentImageIndex]}
                  alt={post.title}
                  className="main-image"
                />
                {images.length > 1 && (
                  <>
                    <button
                      className="slider-btn prev"
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                      className="slider-btn next"
                      onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                    <div className="image-counter">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="no-image">
                <i className="fa-regular fa-image"></i>
                <span>등록된 이미지가 없습니다</span>
              </div>
            )}
          </div>

          {/* 판매자 정보 */}
          <div className="seller-section">
            <div className="seller-avatar">
              {formatDisplayName(post.userId)?.charAt(0)?.toUpperCase()}
            </div>
            <div className="seller-info">
              <span className="seller-name">{formatDisplayName(post.userId)}</span>
              <span className="seller-label">판매자</span>
            </div>
            {loginUserId && !isOwner && (
              <button className="chat-seller-btn" onClick={() => handleStartChat(post.userId)}>
                <i className="fa-regular fa-comment-dots"></i>
                채팅하기
              </button>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="product-section">
            <h1 className="product-title">{post.title}</h1>
            <div className="product-meta">
              <span className="category">중고거래</span>
              <span className="dot">·</span>
              <span className="time">{getRelativeTime(post.createdAt)}</span>
            </div>
            <p className="product-price">{Number(post.price).toLocaleString()}원</p>

            <div
              className="product-description"
              dangerouslySetInnerHTML={{ __html: removeImages(post.content) }}
            />

            <div className="product-stats">
              <span className="stat">
                <i className="fa-regular fa-eye"></i>
                조회 {post.views}
              </span>
              <button className={`like-btn-stat ${liked ? 'active' : ''}`} onClick={handleLike}>
                <i className={`fa-${liked ? 'solid' : 'regular'} fa-heart`}></i>
                <span>좋아요 {likeCount}</span>
              </button>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="comment-section">
            <h3 className="section-title">
              <i className="fa-regular fa-comment"></i>
              댓글 <span className="count">{comments.length}</span>
            </h3>

            {/* 댓글 입력 */}
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                placeholder="댓글을 입력해주세요"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" disabled={!newComment.trim()}>
                등록
              </button>
            </form>

            {/* 댓글 목록 */}
            <div className="comment-list">
              {comments.length === 0 ? (
                <div className="no-comments">
                  <p>아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    {editingCommentId === comment.id ? (
                      <div className="comment-edit">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="edit-actions">
                          <button className="cancel" onClick={cancelEditing}>취소</button>
                          <button className="save" onClick={() => handleCommentUpdate(comment.id)}>저장</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="comment-header">
                          <div className="comment-avatar">
                            {formatDisplayName(comment.username)?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="comment-info">
                            <span className="comment-author">{formatDisplayName(comment.username)}</span>
                            <span className="comment-time">{getRelativeTime(comment.createdAt)}</span>
                          </div>
                          {loginUserId && !isSameUser(loginUserId, comment.username) && (
                            <button
                              className="comment-chat-btn"
                              onClick={() => handleStartChat(comment.username)}
                            >
                              채팅
                            </button>
                          )}
                        </div>
                        <p className="comment-content">{comment.content}</p>
                        {loginUserId && isSameUser(loginUserId, comment.username) && (
                          <div className="comment-actions">
                            <button onClick={() => startEditing(comment)}>수정</button>
                            <button onClick={() => handleCommentDelete(comment.id)}>삭제</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 하단 고정 바 - 타인 게시글일 때만 표시 */}
      {loginUserId && !isOwner && (
        <div className="bottom-bar">
          <div className="price-info">
            <span className="price">{Number(post.price).toLocaleString()}원</span>
          </div>
          <button className="chat-btn" onClick={() => handleStartChat(post.userId)}>
            <i className="fa-regular fa-comment-dots"></i>
            채팅하기
          </button>
        </div>
      )}
    </div>
  );
}
