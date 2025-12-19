import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../css/Withdraw.css";

export default function Withdraw({ loginUserId }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // 은행 목록
  const banks = [
    { code: "004", name: "KB국민은행" },
    { code: "088", name: "신한은행" },
    { code: "020", name: "우리은행" },
    { code: "081", name: "하나은행" },
    { code: "003", name: "기업은행" },
    { code: "011", name: "농협은행" },
    { code: "090", name: "카카오뱅크" },
    { code: "089", name: "케이뱅크" },
    { code: "092", name: "토스뱅크" },
  ];

  // 잔액 조회
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await axios.get("/api/wallet/balance");
        setBalance(res.data.balance);
      } catch (err) {
        console.log("잔액 조회 실패:", err);
      }
    };
    fetchBalance();
  }, []);

  // 금액 입력 처리
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
  };

  // 계좌번호 입력 처리
  const handleAccountNumberChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAccountNumber(value);
  };

  // 출금 신청
  const handleWithdraw = async () => {
    // 유효성 검사
    if (!bankCode) {
      alert("은행을 선택해주세요.");
      return;
    }
    if (!accountNumber) {
      alert("계좌번호를 입력해주세요.");
      return;
    }
    if (!accountHolder) {
      alert("예금주를 입력해주세요.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("출금 금액을 입력해주세요.");
      return;
    }
    if (Number(amount) > Number(balance)) {
      alert("잔액이 부족합니다.");
      return;
    }

    const selectedBank = banks.find((b) => b.code === bankCode);
    if (
      !window.confirm(
        `${selectedBank.name}\n${accountNumber}\n${accountHolder}\n\n${Number(amount).toLocaleString()}원을 출금하시겠습니까?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/wallet/withdraw", {
        bankCode,
        accountNumber,
        accountHolder,
        amount: Number(amount),
      });

      alert("출금 신청이 완료되었습니다.\n영업일 기준 1-2일 내에 처리됩니다.");
      navigate("/wallet");
    } catch (err) {
      console.log("출금 실패:", err);
      alert(err.response?.data?.error || "출금 신청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdraw-container">
      {/* 상단 네비게이션 */}
      <nav className="withdraw-nav">
        <div className="nav-inner">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="nav-title">출금하기</h1>
          <div className="nav-right">
            <button className="home-btn" onClick={() => navigate("/")}>
              <i className="fa-solid fa-house"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="withdraw-content">
        {/* 잔액 표시 */}
        <div className="balance-info">
          <span className="label">출금 가능 금액</span>
          <div className="balance-amount">
            <span className="amount">{Number(balance).toLocaleString()}</span>
            <span className="currency">원</span>
          </div>
        </div>

        {/* 출금 정보 입력 */}
        <div className="withdraw-form">
          {/* 은행 선택 */}
          <div className="form-group">
            <label>은행 선택</label>
            <select
              className="form-select"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
            >
              <option value="">은행을 선택하세요</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          {/* 계좌번호 */}
          <div className="form-group">
            <label>계좌번호</label>
            <input
              type="text"
              className="form-input"
              placeholder="'-' 없이 입력"
              value={accountNumber}
              onChange={handleAccountNumberChange}
            />
          </div>

          {/* 예금주 */}
          <div className="form-group">
            <label>예금주</label>
            <input
              type="text"
              className="form-input"
              placeholder="예금주명을 입력하세요"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
            />
          </div>

          {/* 출금 금액 */}
          <div className="form-group">
            <label>출금 금액</label>
            <div className="amount-input-wrapper">
              <input
                type="text"
                className="amount-input"
                placeholder="금액을 입력하세요"
                value={amount ? Number(amount).toLocaleString() : ""}
                onChange={handleAmountChange}
              />
              <span className="unit">원</span>
            </div>
          </div>
        </div>

        {/* 안내사항 */}
        <div className="notice-box">
          <div className="notice-header">
            <i className="fa-solid fa-circle-info"></i>
            <span>출금 안내</span>
          </div>
          <ul className="notice-list">
            <li>출금 신청 후 영업일 기준 1-2일 내에 입금됩니다.</li>
            <li>출금 수수료는 없습니다.</li>
            <li>출금 가능 시간은 24시간입니다.</li>
            <li>본인 명의의 계좌로만 출금 가능합니다.</li>
          </ul>
        </div>
      </div>

      {/* 출금 버튼 */}
      <div className="withdraw-footer">
        <button
          className="withdraw-btn"
          onClick={handleWithdraw}
          disabled={
            !bankCode || !accountNumber || !accountHolder || !amount || Number(amount) <= 0 || loading
          }
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              처리 중...
            </>
          ) : (
            <>
              <i className="fa-solid fa-building-columns"></i>
              {amount && Number(amount) > 0 ? `${Number(amount).toLocaleString()}원 출금하기` : "금액을 입력하세요"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
