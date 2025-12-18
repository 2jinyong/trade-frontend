import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  // 유저 ID 비교 (소셜 로그인 고려)
  const isSameUser = useCallback((userId1, userId2) => {
    if (!userId1 || !userId2) return false;
    // 정확한 비교를 위해 trim 및 소문자 변환
    const id1 = String(userId1).trim().toLowerCase();
    const id2 = String(userId2).trim().toLowerCase();
    if (id1 === id2) return true;
    // @ 앞부분만 비교 (소셜 로그인 대응)
    const format = (name) => name.includes('@') ? name.split('@')[0] : name;
    return format(id1) === format(id2);
  }, []);

  // 기존 데이터 불러오기
  useEffect(() => {
    axios.get(`/api/posts/${id}`)
      .then((res) => {
        const post = res.data;
        // 작성자 확인
        if (!isSameUser(post.userId, loginUserId)) {
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
  }, [id, loginUserId, navigate, isSameUser]);

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
    return (
      <div className="post-create-container">
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, marginBottom: 16 }}></i>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

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
          <i className="fa-solid fa-pen"></i>
          상품 수정
        </h1>
        <p>상품 정보를 수정해주세요</p>
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
              key="quill-edit"
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
          <button className="cancel-btn" onClick={() => navigate(-1)}>
            취소
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            <i className="fa-solid fa-check"></i>
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
}
