# 중고마켓 - Frontend

중고거래 플랫폼의 프론트엔드 저장소입니다.

## 배포 사이트

- **Frontend**: [https://main.d32flqff9mmre3.amplifyapp.com](https://main.d32flqff9mmre3.amplifyapp.com)
- **Backend API**: [https://trade-jinyong.duckdns.org](https://trade-jinyong.duckdns.org)

## 기술 스택

- **React 18** - UI 라이브러리
- **React Router v7** - 클라이언트 사이드 라우팅
- **Axios** - HTTP 클라이언트
- **React Quill** - 리치 텍스트 에디터
- **Toss Payments SDK** - 결제 시스템
- **STOMP.js + SockJS** - 실시간 채팅
- **Bootstrap 5** - UI 컴포넌트

## 주요 기능

### 사용자 인증
- 일반 회원가입/로그인
- 소셜 로그인 (Google, Naver)
- 세션 기반 인증

### 중고거래
- 상품 목록 조회 (페이징, 정렬)
- 상품 등록/수정/삭제
- 이미지 업로드 (S3 연동)
- 상품 상세 조회

### 실시간 채팅
- 판매자-구매자 1:1 채팅
- WebSocket 기반 실시간 메시지
- 채팅방 목록 관리

### 지갑 시스템
- 잔액 조회
- 토스페이먼츠 연동 충전
- 출금 신청
- 거래 내역 조회

### 마이페이지
- 내 정보 조회
- 판매 상품 목록
- 구매 내역

## 프로젝트 구조

```
src/
├── api/
│   └── axios.js          # Axios 인스턴스 설정
├── css/                   # 스타일시트
├── pages/
│   ├── Home.jsx          # 메인 페이지
│   ├── Login.jsx         # 로그인
│   ├── Register.jsx      # 회원가입
│   ├── PostCreate.jsx    # 상품 등록
│   ├── PostDetail.jsx    # 상품 상세
│   ├── PostEdit.jsx      # 상품 수정
│   ├── ChatList.jsx      # 채팅 목록
│   ├── ChatRoom.jsx      # 채팅방
│   ├── Wallet.jsx        # 지갑
│   ├── Charge.jsx        # 충전
│   ├── Withdraw.jsx      # 출금
│   └── MyPage.jsx        # 마이페이지
└── App.js                # 라우팅 설정
```

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build
```

## 환경 변수

`.env` 파일 또는 Amplify 환경 변수 설정:

```bash
REACT_APP_API_URL=https://trade-jinyong.duckdns.org
```

## 배포

AWS Amplify를 통해 자동 배포됩니다.
- `main` 브랜치에 푸시하면 자동으로 빌드 및 배포

## 관련 저장소

- **Backend**: [trade-backend](https://github.com/2jinyong/trade-backend)
