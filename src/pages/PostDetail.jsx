import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams } from "react-router-dom";

const PostDetail = () => {
  const { id } = useParams();              // URL에서 /posts/:id 받아옴
  const [post, setPost] = useState(null);

  // 🍪 1) 쿠키 읽기
  const getViewedCookie = () => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("viewedPosts="));

    return cookie ? JSON.parse(cookie.split("=")[1]) : {};
  };

  // 🍪 2) 쿠키 저장
  const setViewedCookie = (data) => {
    const expire = new Date();
    expire.setHours(23, 59, 59, 999); // 오늘 밤까지 유지

    document.cookie = `viewedPosts=${JSON.stringify(data)}; path=/; expires=${expire.toUTCString()}`;
  };

  // 🟩 상세 페이지 들어올 때 처리
  useEffect(() => {
    const viewed = getViewedCookie();

    // 🔥 오늘 처음 보는 글이면 조회수 +1 API 호출
    if (!viewed[id]) {
      axios.post(`/api/posts/${id}/views`);
      viewed[id] = true;
      setViewedCookie(viewed);
    }

    // 🔥 상세 정보 불러오기
    axios.get(`/api/posts/${id}`).then((res) => setPost(res.data));
  }, [id]);

  if (!post) return <div>로딩 중...</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto" }}>
      <h2>{post.title}</h2>
      <p>조회수: {post.views}</p>

      <div
        dangerouslySetInnerHTML={{ __html: post.content }}
        style={{ marginTop: "20px" }}
      />
    </div>
  );
};

export default PostDetail;
