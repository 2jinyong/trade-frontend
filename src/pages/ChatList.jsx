import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../css/Chat.css";

export default function ChatList({ loginUserId }) {
  const [chatRooms, setChatRooms] = useState([]);
  const navigate = useNavigate();

  // 소셜로그인 유저 아이디 포맷팅
  const formatDisplayName = (name) => {
    if (name && name.includes('@')) {
      return name.split('@')[0];
    }
    return name;
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    }
  };

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const res = await axios.get("/api/chat/rooms");
        setChatRooms(res.data);
      } catch (err) {
        console.log("채팅 목록 불러오기 실패:", err);
      }
    };
    fetchChatRooms();
  }, []);

  return (
    <div className="chat-list-container">
      {/* 상단 네비게이션 */}
      <nav className="chat-nav">
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

      {/* 채팅 헤더 */}
      <div className="chat-list-header">
        <h2>
          <i className="fa-regular fa-comment-dots"></i>
          채팅
        </h2>
        <span className="chat-count">{chatRooms.length}개의 대화</span>
      </div>

      {/* 채팅방 목록 */}
      <div className="chat-rooms">
        {chatRooms.length === 0 ? (
          <div className="empty-state">
            <i className="fa-regular fa-comments"></i>
            <p>아직 채팅 내역이 없어요</p>
            <span className="empty-hint">상품 페이지에서 판매자에게 채팅을 시작해보세요</span>
          </div>
        ) : (
          chatRooms.map((room) => (
            <div
              key={room.roomId}
              className="chat-room-item"
              onClick={() => navigate(`/chat/${room.roomId}`)}
            >
              <div className="chat-room-avatar">
                {formatDisplayName(room.partnerUserId)?.charAt(0).toUpperCase()}
              </div>
              <div className="chat-room-info">
                <div className="chat-room-top">
                  <span className="partner-name">{formatDisplayName(room.partnerUserId)}</span>
                  <span className="chat-time">{formatDate(room.createdAt)}</span>
                </div>
                <p className="last-message">채팅을 시작해보세요</p>
              </div>
              <i className="fa-solid fa-chevron-right chat-arrow"></i>
            </div>
          ))
        )}
      </div>

      {/* 모바일 하단 네비게이션 */}
      <nav className="bottom-nav">
        <button className="bottom-nav-item" onClick={() => navigate("/")}>
          <i className="fa-solid fa-house"></i>
          <span>홈</span>
        </button>
        <button className="bottom-nav-item active">
          <i className="fa-solid fa-comment-dots"></i>
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
}
