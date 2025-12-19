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
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");

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

  // 송금하기
  const handleTransfer = async () => {
    const amount = Number(transferAmount);
    if (!amount || amount <= 0) {
      alert("송금할 금액을 입력해주세요.");
      return;
    }

    if (!window.confirm(`${formatDisplayName(partnerName)}님께 ${amount.toLocaleString()}원을 송금하시겠습니까?`)) {
      return;
    }

    try {
      const res = await axios.post("/api/wallet/transfer", {
        receiverUserId: partnerName,
        amount: amount,
      });

      alert(`${amount.toLocaleString()}원을 송금했습니다.`);
      setShowTransferModal(false);
      setTransferAmount("");

      // 송금 성공 시스템 메시지 전송
      if (stompClient && connected) {
        stompClient.publish({
          destination: "/pub/chat/message",
          headers: {
            senderUserId: loginUserId,
          },
          body: JSON.stringify({
            roomId: parseInt(roomId),
            content: `${amount.toLocaleString()}원을 송금했습니다.`,
            messageType: "TRANSFER",
          }),
        });
      }
    } catch (err) {
      console.log("송금 실패:", err);
      alert(err.response?.data?.error || "송금에 실패했습니다.");
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
          <button className="transfer-btn" onClick={() => setShowTransferModal(true)} title="송금하기">
            <i className="fa-solid fa-money-bill-transfer"></i>
          </button>
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
            className={`message ${msg.senderUserId === loginUserId ? 'mine' : 'other'} ${msg.messageType === 'TRANSFER' ? 'transfer' : ''}`}
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
              <div className={`message-bubble ${msg.messageType === 'TRANSFER' ? 'transfer-bubble' : ''}`}>
                {msg.messageType === 'TRANSFER' && (
                  <i className="fa-solid fa-money-bill-transfer transfer-icon"></i>
                )}
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

      {/* 송금 모달 */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal-content transfer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-money-bill-transfer"></i>
                송금하기
              </h3>
              <button className="modal-close" onClick={() => setShowTransferModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="transfer-recipient">
                <label>받는 사람</label>
                <div className="recipient-info">
                  <div className="recipient-avatar">
                    {formatDisplayName(partnerName)?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="recipient-name">{formatDisplayName(partnerName)}</span>
                </div>
              </div>
              <div className="transfer-amount-input">
                <label>송금 금액</label>
                <div className="amount-input-wrapper">
                  <input
                    type="text"
                    placeholder="금액을 입력하세요"
                    value={transferAmount ? Number(transferAmount).toLocaleString() : ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setTransferAmount(value);
                    }}
                  />
                  <span className="unit">원</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowTransferModal(false)}>
                취소
              </button>
              <button className="modal-btn confirm" onClick={handleTransfer}>
                <i className="fa-solid fa-paper-plane"></i>
                송금하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
