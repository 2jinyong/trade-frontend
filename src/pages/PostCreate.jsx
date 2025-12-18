import React, { useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import axios from "../api/axios";
import "../css/PostCreate.css";

export default function PostCreate({ isLogin }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [content, setContent] = useState("");
  const quillRef = useRef(null);
  const navigate = useNavigate();

  // 로그인 안 되어 있으면 Redirect
  if (!isLogin) return <Navigate to="/login" replace />;

  // 이미지 업로드 핸들러
  const imageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await axios.post("/api/posts/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const url = res.data.url;
        const editor = quillRef.current.getEditor();
        let range = editor.getSelection();

        // range null 보호
        if (!range) {
          range = { index: editor.getLength(), length: 0 };
        }

        editor.insertEmbed(range.index, "image", url);
        editor.setSelection(range.index + 1);
      } catch (err) {
        alert("이미지 업로드 실패");
      }
    };
  };

  // 툴바 옵션
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: { image: imageHandler },
    },
  };

  // 등록 버튼 핸들러
  const handleSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력하세요!");
    if (!price.trim()) return alert("가격을 입력하세요!");
    if (!content.trim() || content === "<p><br></p>")
      return alert("내용을 입력하세요!");

    await axios.post("/api/posts", { title, price, content });
    navigate("/");
  };

  return (
    <div className="post-create-container">
      {/* 상단 네비게이션 */}
      <nav className="create-nav">
        <div className="nav-inner">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="nav-logo" onClick={() => navigate("/")}>
            <div className="logo-icon">
              <i className="fa-solid fa-handshake-angle"></i>
            </div>
            <span>중고마켓</span>
          </div>
          <div className="nav-right"></div>
        </div>
      </nav>

      {/* 페이지 헤더 */}
      <div className="create-header">
        <h1>
          <i className="fa-solid fa-tag"></i>
          상품 등록
        </h1>
        <p>판매할 상품 정보를 입력해주세요</p>
      </div>

      {/* 폼 영역 */}
      <div className="create-form">
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">
              <i className="fa-solid fa-heading"></i>
              제목
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="상품 제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fa-solid fa-won-sign"></i>
              가격
            </label>
            <div className="price-input-wrapper">
              <input
                type="number"
                className="form-input"
                placeholder="판매 가격을 입력해주세요"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <span className="price-unit">원</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fa-solid fa-align-left"></i>
              상품 설명
            </label>
            <ReactQuill
              ref={quillRef}
              key="quill-new"
              value={content}
              onChange={setContent}
              modules={modules}
              theme="snow"
              className="quill-editor"
              placeholder="상품에 대해 자세히 설명해주세요. 사진을 추가하면 더 좋아요!"
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="form-actions">
          <button className="cancel-btn" onClick={() => navigate("/")}>
            취소
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            <i className="fa-solid fa-check"></i>
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
