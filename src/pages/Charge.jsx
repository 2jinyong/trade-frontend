import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import axios from "../api/axios";
import "../css/Charge.css";

export default function Charge({ loginUserId }) {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [tossPayments, setTossPayments] = useState(null);
  const [clientKey, setClientKey] = useState(null);
  const paymentWidgetRef = useRef(null);
  const paymentMethodWidgetRef = useRef(null);

  const presetAmounts = [
    { value: 5000, label: "5,000원" },
    { value: 10000, label: "10,000원" },
    { value: 30000, label: "30,000원" },
    { value: 50000, label: "50,000원" },
    { value: 100000, label: "100,000원" },
  ];

  // 토스 테스트 클라이언트 키 (결제위젯 연동용)
  const TEST_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

  // 토스 SDK 초기화
  useEffect(() => {
    const initToss = async () => {
      try {
        setClientKey(TEST_CLIENT_KEY);
        const toss = await loadTossPayments(TEST_CLIENT_KEY);
        setTossPayments(toss);
      } catch (err) {
        console.log("토스 초기화 실패:", err);
      }
    };
    initToss();
  }, []);

  // 결제 위젯 렌더링
  useEffect(() => {
    if (!tossPayments || !selectedAmount) return;

    const amount = selectedAmount === "custom" ? Number(customAmount) : selectedAmount;
    if (!amount || amount < 1000) return;

    const renderWidget = async () => {
      try {
        // 기존 위젯 정리
        if (paymentWidgetRef.current) {
          const container = document.getElementById("payment-widget");
          if (container) container.innerHTML = "";
        }

        // 결제 위젯 생성
        const widgets = tossPayments.widgets({ customerKey: loginUserId });
        paymentWidgetRef.current = widgets;

        await widgets.setAmount({
          currency: "KRW",
          value: amount,
        });

        // 결제 수단 위젯 렌더링
        await widgets.renderPaymentMethods({
          selector: "#payment-widget",
          variantKey: "DEFAULT",
        });

        paymentMethodWidgetRef.current = widgets;
      } catch (err) {
        console.log("위젯 렌더링 실패:", err);
      }
    };

    renderWidget();
  }, [tossPayments, selectedAmount, customAmount, loginUserId]);

  // 금액 선택
  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  // 직접 입력
  const handleCustomAmount = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(value);
    if (value) {
      setSelectedAmount("custom");
    }
  };

  // 결제하기
  const handlePayment = async () => {
    const amount = selectedAmount === "custom" ? Number(customAmount) : selectedAmount;

    if (!amount || amount < 1000) {
      alert("1,000원 이상 충전 가능합니다.");
      return;
    }

    if (!paymentWidgetRef.current) {
      alert("결제 위젯을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 결제 준비 API 호출
      const prepareRes = await axios.post("/api/payment/prepare", { amount });
      const { orderId, orderName, customerName } = prepareRes.data;

      // 토스 결제 요청
      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName,
        customerName,
        successUrl: `${window.location.origin}/wallet/charge/success`,
        failUrl: `${window.location.origin}/wallet/charge/fail`,
      });
    } catch (err) {
      console.log("결제 요청 실패:", err);
      alert("결제 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = selectedAmount === "custom" ? Number(customAmount) : selectedAmount;

  return (
    <div className="charge-container">
      {/* 상단 네비게이션 */}
      <nav className="charge-nav">
        <div className="nav-inner">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="nav-title">충전하기</h1>
          <div className="nav-right">
            <button className="home-btn" onClick={() => navigate("/")}>
              <i className="fa-solid fa-house"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="charge-content">
        {/* 금액 선택 섹션 */}
        <section className="amount-section">
          <h2 className="section-title">
            <i className="fa-solid fa-coins"></i>
            충전할 금액
          </h2>

          <div className="preset-amounts">
            {presetAmounts.map((item) => (
              <button
                key={item.value}
                className={`amount-btn ${selectedAmount === item.value ? "active" : ""}`}
                onClick={() => handleAmountSelect(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="custom-amount">
            <label>직접 입력</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="금액을 입력하세요"
                value={customAmount ? Number(customAmount).toLocaleString() : ""}
                onChange={handleCustomAmount}
              />
              <span className="unit">원</span>
            </div>
            <p className="hint">최소 1,000원 이상</p>
          </div>
        </section>

        {/* 결제 수단 섹션 */}
        {finalAmount >= 1000 && (
          <section className="payment-section">
            <h2 className="section-title">
              <i className="fa-solid fa-credit-card"></i>
              결제 수단
            </h2>
            <div id="payment-widget"></div>
          </section>
        )}

        {/* 결제 금액 표시 */}
        {finalAmount >= 1000 && (
          <div className="payment-summary">
            <div className="summary-row">
              <span>충전 금액</span>
              <span className="amount">{finalAmount?.toLocaleString()}원</span>
            </div>
          </div>
        )}
      </div>

      {/* 결제 버튼 */}
      <div className="charge-footer">
        <button
          className="charge-btn"
          onClick={handlePayment}
          disabled={!finalAmount || finalAmount < 1000 || loading}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              처리 중...
            </>
          ) : (
            <>
              <i className="fa-solid fa-wallet"></i>
              {finalAmount >= 1000 ? `${finalAmount.toLocaleString()}원 충전하기` : "금액을 선택하세요"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
