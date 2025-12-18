import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../css/ChargeResult.css";

export default function ChargeFail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  return (
    <div className="charge-result-container">
      <div className="result-card error">
        <div className="result-icon error">
          <i className="fa-solid fa-xmark"></i>
        </div>
        <h2>결제 실패</h2>
        <p className="error-message">
          {errorMessage || "결제 처리 중 오류가 발생했습니다."}
        </p>

        {errorCode && (
          <div className="error-code">
            오류 코드: {errorCode}
          </div>
        )}

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
