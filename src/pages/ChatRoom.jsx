import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "../api/axios";
import "../css/Chat.css";

export default function ChatRoom({ loginUserId }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const messagesEndRef = useRef(null);

  // 소셜로그인 유저 아이디 포맷팅
  const formatDisplayName = (name) => {
    if (name && name.includes('@')) {
      return name.split('@')[0];
    }
    return name;
  };

  // 날짜 포맷팅
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 스크롤을 최하단으로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 기존 메시지 불러오기
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/chat/room/${roomId}/messages`);
        setMessages(res.data);
        // 상대방 이름 설정
        if (res.data.length > 0) {
          const otherUser = res.data.find(m => m.senderUserId !== loginUserId);
          if (otherUser) {
            setPartnerName(otherUser.senderUserId);
          }
        }
      } catch (err) {
        console.log("메시지 불러오기 실패:", err);
      }
    };
    fetchMessages();
  }, [roomId, loginUserId]);

  // WebSocket 연결
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8081/ws"),
      connectHeaders: {
        senderUserId: loginUserId,
      },
      onConnect: () => {
        setConnected(true);
        // 채팅방 구독
        client.subscribe(`/sub/chat/room/${roomId}`, (message) => {
          const newMsg = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMsg]);
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [roomId, loginUserId]);

  // 메시지 전송
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !stompClient || !connected) return;

    stompClient.publish({
      destination: "/pub/chat/message",
      headers: {
        senderUserId: loginUserId,
      },
      body: JSON.stringify({
        roomId: parseInt(roomId),
        content: newMessage,
      }),
    });

    setNewMessage("");
  };

  // 채팅방 나가기
  const handleLeaveRoom = async () => {
    if (!window.confirm("채팅방을 나가시겠습니까?\n나가면 채팅 목록에서 사라집니다.")) return;
    try {
      await axios.delete(`/api/chat/room/${roomId}`);
      navigate("/chat", { replace: true });
    } catch (err) {
      alert("채팅방 나가기 실패");
    }
  };

  return (
    <div className="chat-room-container">
      {/* 상단 헤더 */}
      <nav className="chat-room-nav">
        <div className="nav-inner">
          <button className="back-btn" onClick={() => navigate("/chat", { replace: true })}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="chat-partner-info">
            <div className="partner-avatar">
              {formatDisplayName(partnerName)?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="partner-details">
              <span className="partner-name">{formatDisplayName(partnerName) || "채팅"}</span>
              <span className={`connection-status ${connected ? 'connected' : ''}`}>
                {connected ? "온라인" : "연결 중..."}
              </span>
            </div>
          </div>
          <button className="leave-btn" onClick={handleLeaveRoom}>
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </nav>

      {/* 메시지 영역 */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-start-message">
            <div className="start-icon">
              <i className="fa-regular fa-comments"></i>
            </div>
            <p>대화를 시작해보세요!</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={msg.messageId || index}
            className={`message ${msg.senderUserId === loginUserId ? 'mine' : 'other'}`}
          >
            {msg.senderUserId !== loginUserId && (
              <div className="message-avatar">
                {formatDisplayName(msg.senderUserId)?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="message-content-wrap">
              {msg.senderUserId !== loginUserId && (
                <span className="sender-name">{formatDisplayName(msg.senderUserId)}</span>
              )}
              <div className="message-bubble">
                <p className="message-content">{msg.content}</p>
              </div>
              <span className="message-time">{formatTime(msg.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="메시지를 입력하세요"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="send-btn" disabled={!connected || !newMessage.trim()}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
}
