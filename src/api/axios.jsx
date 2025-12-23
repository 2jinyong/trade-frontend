import axios from "axios";

// 백엔드 주소 (Spring 서버 주소)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true; // ✅ 쿠키 자동 포함

export { API_URL };
export default axios;
