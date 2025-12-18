import axios from "axios";

// 백엔드 주소 (Spring 서버 주소)
axios.defaults.baseURL = "http://localhost:8081";
axios.defaults.withCredentials = true; // ✅ 쿠키 자동 포함

export default axios;
