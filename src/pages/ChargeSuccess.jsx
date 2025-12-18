import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import "../css/ChargeResult.css";

export default function ChargeSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        setError("결제 정보가 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post("/api/payment/confirm", {
          paymentKey,
          orderId,
          amount: Number(amount),
        });

        setResult(res.data);
      } catch (err) {
        console.log("결제 승인 실패:", err);
        setError(err.response?.data?.error || "결제 승인에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="charge-result-container">
        <div className="result-card loading">
          <div className="loading-spinner">
            <i className="fa-solid fa-spinner fa-spin"></i>
          </div>
          <h2>결제 확인 중...</h2>
          <p>잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charge-result-container">
        <div className="result-card error">
          <div className="result-icon error">
            <i className="fa-solid fa-xmark"></i>
          </div>
          <h2>결제 실패</h2>
          <p className="error-message">{error}</p>
          <div className="result-actions">
            <button className="action-btn secondary" onClick={() => navigate("/wallet")}>
              지갑으로 돌아가기
            </button>
            <button className="action-btn primary" onClick={() => navigate("/wallet/charge")}>
              다시 시도하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="charge-result-container">
      <div className="result-card success">
        <div className="result-icon success">
          <i className="fa-solid fa-check"></i>
        </div>
        <h2>충전 완료!</h2>
        <p className="success-message">{result?.message}</p>

        <div className="result-details">
          <div className="detail-row">
            <span className="label">충전 금액</span>
            <span className="value">{Number(result?.amount).toLocaleString()}원</span>
          </div>
          <div className="detail-row">
            <span className="label">주문번호</span>
            <span className="value order-id">{result?.orderId}</span>
          </div>
        </div>

        <div className="result-actions">
          <button className="action-btn secondary" onClick={() => navigate("/")}>
            홈으로
          </button>
          <button className="action-btn primary" onClick={() => navigate("/wallet")}>
            지갑 확인하기
          </button>
        </div>
      </div>
    </div>
  );
}
