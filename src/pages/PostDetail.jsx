import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

const PostDetail = () => {
const { id } = useParams();
const [post, setPost] = useState(null);

useEffect(() => {
  axios.get(`/api/posts/${id}`).then(res => setPost(res.data));
}, [id]);

return (
  <div style={{textAlign:"center"}}>
    <h4 className='mt-5'>제목 : {post?.title}</h4>
    <h4 className='mb-4'>상품가격 : {post?.price}원</h4>
    <div dangerouslySetInnerHTML={{ __html: post?.content }} />
  </div>
);

}

export default PostDetail