import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../css/Wallet.css";

export default function Wallet({ loginUserId }) {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // 소셜로그인 유저 아이디 포맷팅
  const formatDisplayName = (name) => {
    if (name && name.includes("@")) {
      return name.split("@")[0];
    }
    return name;
  };

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return Number(amount).toLocaleString();
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 거래 유형 한글 변환
  const getTransactionTypeLabel = (type) => {
    const labels = {
      CHARGE: "충전",
      WITHDRAW: "출금",
      TRANSFER_IN: "받은 송금",
      TRANSFER_OUT: "보낸 송금",
    };
    return labels[type] || type;
  };

  // 거래 유형 아이콘
  const getTransactionIcon = (type) => {
    const icons = {
      CHARGE: "fa-plus",
      WITHDRAW: "fa-minus",
      TRANSFER_IN: "fa-arrow-down",
      TRANSFER_OUT: "fa-arrow-up",
    };
    return icons[type] || "fa-exchange";
  };

  // 지갑 정보 조회
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get("/api/wallet");
        setWallet(res.data);
      } catch (err) {
        console.log("지갑 조회 실패:", err);
      }
    };
    fetchWallet();
  }, []);

  // 거래내역 조회
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        let url = "/api/wallet/transactions";
        if (activeTab !== "all") {
          url = `/api/wallet/transactions/${activeTab}`;
        }
        const res = await axios.get(url);
        setTransactions(res.data.content || []);
      } catch (err) {
        console.log("거래내역 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [activeTab]);

  return (
    <div className="wallet-container">
      {/* 상단 네비게이션 */}
      <nav className="wallet-nav">
        <div className="nav-inner">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="nav-title">내 지갑</h1>
          <div className="nav-right"></div>
        </div>
      </nav>

      {/* 잔액 카드 */}
      <div className="balance-card">
        <div className="balance-header">
          <span className="balance-label">사용 가능 잔액</span>
          <i className="fa-solid fa-wallet"></i>
        </div>
        <div className="balance-amount">
          <span className="amount">{wallet ? formatAmount(wallet.balance) : "0"}</span>
          <span className="currency">원</span>
        </div>
        <div className="balance-actions">
          <button className="action-btn charge" onClick={() => navigate("/wallet/charge")}>
            <i className="fa-solid fa-plus"></i>
            <span>충전</span>
          </button>
          <button className="action-btn transfer" onClick={() => navigate("/wallet/transfer")}>
            <i className="fa-solid fa-paper-plane"></i>
            <span>송금</span>
          </button>
          <button className="action-btn withdraw" onClick={() => navigate("/wallet/withdraw")}>
            <i className="fa-solid fa-building-columns"></i>
            <span>출금</span>
          </button>
        </div>
      </div>

      {/* 거래내역 섹션 */}
      <div className="transactions-section">
        <div className="section-header">
          <h2>거래내역</h2>
        </div>

        {/* 탭 필터 */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            전체
          </button>
          <button
            className={`tab ${activeTab === "charge" ? "active" : ""}`}
            onClick={() => setActiveTab("charge")}
          >
            충전
          </button>
          <button
            className={`tab ${activeTab === "transfer_in" ? "active" : ""}`}
            onClick={() => setActiveTab("transfer_in")}
          >
            받은 송금
          </button>
          <button
            className={`tab ${activeTab === "transfer_out" ? "active" : ""}`}
            onClick={() => setActiveTab("transfer_out")}
          >
            보낸 송금
          </button>
        </div>

        {/* 거래내역 리스트 */}
        <div className="transactions-list">
          {loading ? (
            <div className="loading">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>불러오는 중...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <i className="fa-regular fa-receipt"></i>
              <p>거래내역이 없습니다</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className={`tx-icon ${tx.type.toLowerCase()}`}>
                  <i className={`fa-solid ${getTransactionIcon(tx.type)}`}></i>
                </div>
                <div className="tx-info">
                  <div className="tx-main">
                    <span className="tx-type">{getTransactionTypeLabel(tx.type)}</span>
                    {tx.counterpartyName && (
                      <span className="tx-counterparty">
                        {tx.type === "TRANSFER_IN" ? "from " : "to "}
                        {formatDisplayName(tx.counterpartyName)}
                      </span>
                    )}
                  </div>
                  <span className="tx-date">{formatDate(tx.createdAt)}</span>
                </div>
                <div className={`tx-amount ${tx.type === "CHARGE" || tx.type === "TRANSFER_IN" ? "plus" : "minus"}`}>
                  {tx.type === "CHARGE" || tx.type === "TRANSFER_IN" ? "+" : "-"}
                  {formatAmount(tx.amount)}원
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
