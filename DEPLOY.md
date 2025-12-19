# 배포 가이드

## 배포 전 체크리스트

### 1. 환경변수 설정

#### 백엔드 (application.properties)
```properties
# 데이터베이스 (H2 → MySQL/PostgreSQL 변경)
spring.datasource.url=jdbc:postgresql://your-db-url:5432/tradedb
spring.datasource.username=your-username
spring.datasource.password=your-password

# 토스 결제 (실제 키로 변경)
toss.payments.client-key=YOUR_REAL_CLIENT_KEY
toss.payments.secret-key=YOUR_REAL_SECRET_KEY
toss.payments.dev-mode=false

# 소셜 로그인
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# 파일 업로드 경로
spring.web.resources.static-locations=file:/app/uploads/
```

#### 프론트엔드
```bash
# .env 파일 생성
REACT_APP_API_URL=https://your-backend-url.com
```

### 2. 프론트엔드 배포 (Vercel)

```bash
# 1. 빌드 테스트
npm run build

# 2. GitHub에 푸시
git add .
git commit -m "배포 준비"
git push origin main

# 3. Vercel 배포
# - vercel.com 접속
# - GitHub 연동
# - 프로젝트 선택
# - 환경변수 설정
# - 배포
```

### 3. 백엔드 배포 (Render)

```bash
# 1. Render.com 접속
# 2. New Web Service 생성
# 3. GitHub 저장소 연결
# 4. 설정:
#    - Build Command: ./gradlew build
#    - Start Command: java -jar build/libs/trade-0.0.1-SNAPSHOT.jar
# 5. 환경변수 추가
# 6. 배포
```

### 4. 데이터베이스 설정 (Render PostgreSQL)

```bash
# 1. Render에서 PostgreSQL 생성
# 2. 연결 정보 복사
# 3. 백엔드 환경변수에 추가
```

## 배포 후 확인 사항

- [ ] 로그인/회원가입 작동
- [ ] 게시글 CRUD 작동
- [ ] 채팅 기능 작동
- [ ] 파일 업로드 작동
- [ ] 결제 기능 작동
- [ ] HTTPS 적용 확인

## 주의사항

1. **CORS 설정**: 백엔드에서 프론트엔드 URL 허용
2. **WebSocket 경로**: wss:// (HTTPS 환경)
3. **파일 업로드**: 클라우드 스토리지 사용 권장 (S3, Cloudinary)
4. **DB 백업**: 정기적인 백업 설정
5. **환경변수**: .env 파일은 .gitignore에 포함

## 트러블슈팅

### CORS 에러
```java
// SecurityConfig.java에 추가
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedOrigin("https://your-frontend-url.vercel.app");
    configuration.addAllowedMethod("*");
    configuration.addAllowedHeader("*");
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### WebSocket 연결 실패
```javascript
// ChatRoom.jsx에서
const client = new Client({
  webSocketFactory: () => new SockJS("https://your-backend-url/ws"),
  // ...
});
```

### 파일 업로드 경로
- 로컬: `file:./uploads/`
- 배포: S3 또는 Cloudinary 사용 권장
