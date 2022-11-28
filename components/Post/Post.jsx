import React, { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { MdOutlineFavoriteBorder, MdFavorite } from "react-icons/md";
import { FaRegCommentAlt } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { storage } from "../../firebase";
import InputEmoji from "react-input-emoji";
import { ref, deleteObject } from "firebase/storage";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { getTimestampDifference } from "../../helper/timestamp-utils";
import { FiDelete } from "react-icons/fi";
import Swal from "sweetalert2";

export default function Post(props) {
  const { data: session } = useSession();

  const [text, setText] = useState("");
  const [timeDiff, setTimeDiff] = useState("");
  const postData = props.post.data();
  const postId = props.post.id;

  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    onSnapshot(
      query(
        collection(db, "posts", postId, "comments"),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => {
        setComments(snapshot.docs);
      }
    );
    const foundTimestamp = postData.timestamp
      ? postData.timestamp.seconds
      : new Date().getTime() / 1000;
    const requiredTimeDiff = getTimestampDifference(foundTimestamp);
    setTimeDiff(requiredTimeDiff);

    onSnapshot(collection(db, "posts", postId, "likes"), (snapshot) => {
      setLikes(snapshot.docs);
    });
  }, []);

  useEffect(() => {
    if (session) {
      setHasLiked(
        likes.findIndex(
          (like) => like.data().userEmail === session.user.email
        ) !== -1
      );
    }
  }, [likes, session]);

  async function uploadComment() {
    if (text.trim().length === 0) {
      return;
    }
    const commentText = text;
    await addDoc(collection(db, "posts", postId, "comments"), {
      author: session.user.name,
      authorDP: session.user.image,
      message: commentText,
      timestamp: serverTimestamp(),
    });
    setText("");
  }
  async function handleCommentSubmit(e) {
    e.preventDefault();
    await uploadComment();
  }

  async function handleLikePost() {
    if (!hasLiked) {
      await setDoc(doc(db, "posts", postId, "likes", session.user.email), {
        userEmail: session.user.email,
      });
    } else {
      await deleteDoc(doc(db, "posts", postId, "likes", session.user.email));
    }
  }
  async function handleDeletePost() {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to really delete this post?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
        var fileRef = ref(storage, postData.image);
        await deleteObject(fileRef).then(async ()=>{
            await deleteDoc(doc(db, "posts", postId, "likes", session.user.email)).then(async ()=>{
                await deleteDoc(doc(db, "posts", postId, "comments", session.user.email)).then(async()=>{
                    await deleteDoc(doc(db, "posts", postId));
                })
            })
        });
      }
    });
  }

  return (
    <>
      <div className={styles.post}>
        <div className={styles.authorDetails}>
          <Image
            src={postData.dp}
            height={42}
            width={42}
            alt="post_dp"
            className={styles.postDp}
          />
          <div className={styles.authorNameEmail}>
            <div>{postData.name}</div> <div>{postData.email}</div>
          </div>

          {session && session.user.email === postData.email && (
            <FiDelete
              className={styles.deleteIcon}
              onClick={handleDeletePost}
            />
          )}
          {
            <FiDelete
              className={styles.deleteIcon}
              onClick={handleDeletePost}
            />
          }
        </div>
        <div className={styles.imageBox}>
          <Image
            src={postData.image}
            height={200}
            width={200}
            alt="post"
            className={styles.postImage}
          />
        </div>
        <div className={styles.postCaption}>{postData.caption}</div>
        {session && (
          <div className={styles.likeCommentShare}>
            {!hasLiked && (
              <MdOutlineFavoriteBorder
                className={styles.loveIcon}
                onClick={handleLikePost}
              />
            )}
            {hasLiked && (
              <MdFavorite
                className={styles.loveFillIcon}
                onClick={handleLikePost}
              />
            )}
            <FaRegCommentAlt className={styles.commentIcon} />
            <BsWhatsapp className={styles.whatsappIcon} />
          </div>
        )}
        <div className={styles.likeCounts}>
          {likes.length > 0 && <div>{likes.length} likes</div>}
          <div>{timeDiff}</div>
        </div>
        <div className={styles.commentSection}>
          {comments.map((comment) => {
            return (
              <div className={styles.comment} key={comment.id}>
                <div className={styles.commentLeft}>
                  <div>
                    {" "}
                    <Image
                      src={comment.data().authorDP}
                      height={40}
                      width={40}
                      alt="comment_author"
                      className={styles.commentAuthorDP}
                    />
                  </div>
                  <div className={styles.commentAuthorName}>
                    {comment.data().author}
                  </div>
                  <div className={styles.commentAuthorMessage}>
                    {comment.data().message}
                  </div>
                </div>
                <div className={styles.commentRight}>
                  {comment.data().timestamp &&
                    getTimestampDifference(comment.data().timestamp.seconds)}
                </div>
              </div>
            );
          })}
        </div>
        {session && (
          <div className={styles.commentForm}>
            <form onSubmit={handleCommentSubmit}>
              <div className={styles.commentInput}>
                <InputEmoji
                  value={text}
                  onChange={setText}
                  cleanOnEnter
                  onEnter={uploadComment}
                  placeholder="Add a comment..."
                  height={10}
                  fontSize={12}
                />
              </div>
              <button type="submit" disabled={text.trim().length === 0}>
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
