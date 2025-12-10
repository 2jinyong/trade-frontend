import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import axios from "../api/axios";
import "../css/PostCreate.css";

export default function PostEdit({ loginUserId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // 기존 데이터 불러오기
  useEffect(() => {
    axios.get(`/api/posts/${id}`)
      .then((res) => {
        const post = res.data;
        // 작성자 확인
        if (post.userId !== loginUserId) {
          alert("수정 권한이 없습니다.");
          navigate("/");
          return;
        }
        setTitle(post.title);
        setPrice(post.price);
        setContent(post.content);
        setLoading(false);
      })
      .catch((err) => {
        alert("게시글을 불러올 수 없습니다.");
        navigate("/");
      });
  }, [id, loginUserId, navigate]);

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

  // 수정 버튼 핸들러
  const handleSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력하세요!");
    if (!price) return alert("가격을 입력하세요!");
    if (!content.trim() || content === "<p><br></p>")
      return alert("내용을 입력하세요!");

    try {
      await axios.put(`/api/posts/${id}`, { title, price, content });
      alert("수정 완료!");
      navigate(`/posts/${id}`);
    } catch (err) {
      alert(err.response?.data || "수정 실패");
    }
  };

  if (loading) {
    return <div style={{ padding: 40 }}>로딩 중...</div>;
  }

  return (
    <Container style={{ maxWidth: "860px", paddingTop: "28px" }}>
      <h2 className="mb-4">게시글 수정</h2>

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
            key="quill-edit"
            value={content}
            onChange={setContent}
            modules={modules}
            theme="snow"
            className="quill-editor"
            placeholder="내용을 입력하세요..."
          />
        </Form.Group>

        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            수정하기
          </Button>
        </div>
      </Form>
    </Container>
  );
}
