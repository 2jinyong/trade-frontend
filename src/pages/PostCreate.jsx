import React, { useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import axios from "../api/axios";
import "../css/PostCreate.css";

export default function PostCreate({ isLogin }) {
  // 🔥 Hooks는 최상단
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
    <Container style={{ maxWidth: "860px", paddingTop: "28px" }}>
      <h2 className="mb-4">판매글 작성</h2>

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>제목</Form.Label>
          <Form.Control
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>가격</Form.Label>
          <Form.Control
            type="number"
            placeholder="가격을 입력하세요"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>내용</Form.Label>

          <ReactQuill
            ref={quillRef}
            key="quill-new"
            value={content}
            onChange={setContent}
            modules={modules}
            theme="snow"
            className="quill-editor"
            placeholder="내용을 입력하세요..."
          />
        </Form.Group>

        <Button variant="success" onClick={handleSubmit}>
          등록하기
        </Button>
      </Form>
    </Container>
  );
}