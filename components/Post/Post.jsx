import React, { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { MdOutlineFavoriteBorder, MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { FaRegCommentAlt } from "react-icons/fa";
import { BsHeartFill, BsWhatsapp } from "react-icons/bs";
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
import {BsThreeDots} from "react-icons/bs"
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import Modal from "react-modal";
import { getProfileData } from "../../helper/api-utils";

export default function Post(props) {
  const { data: session } = useSession();

  const [text, setText] = useState("");
  const [timeDiff, setTimeDiff] = useState("");
  const postData = props.post.data();
  const postId = props.post.id;

  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [visibleCommentBox, setVisibleCommentBox] = useState(false);
  const [visiblePostEditModal, setVisiblePostEditModal] = useState(false);
  const [visibleLikeModal, setVisibleLikeModal] = useState(false);
  const [visibleLoveIcon, setVisibleLoveIcon] = useState(false);

  const router = useRouter();

  function toggleVisibleCommentBox(){
    setVisibleCommentBox(!visibleCommentBox);
  }

  function togglePostEditModal(){
    setVisiblePostEditModal(!visiblePostEditModal);
  }
  function toggleLikeModal(){
    setVisibleLikeModal(!visibleLikeModal);
  }

  useEffect(() => {
    onSnapshot(
      query(
        collection(db, "posts", postId, "comments"),
        orderBy("timestamp")
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

  const [postAuthorDp, setPostAuthorDp] = useState(null);

  useEffect(() => {
    if (session) {
      setHasLiked(
        likes.findIndex(
          (like) => like.data().userEmail === session.user.email
        ) !== -1
      );
    }
  }, [likes, session]);

  useEffect(()=>{
    async function getPostUserDp(){
      const postProfileData = await getProfileData(postData.email.split("@")[0]);
      const postProfileDp = postProfileData && await postProfileData.dp;
      setPostAuthorDp(postProfileDp);
    }
    getPostUserDp();
  }, [])

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
  function handleShareWhatsapp(){
    const wpUrl = `whatsapp://send?text=See this Memogram post by ${postData.name.split(" ")[0]}: https://memogram2.vercel.app/posts/${postId}`;
    window.open(wpUrl);
  }
  function goToProfileHandler(username){
    router.push(`/${username}`);
  }

  const customStyles = {
    overlay:{
      background: "rgba(0,0,0,0.65)",
      zIndex: "100"
    }
  };

  async function handleClickOnPostImage(event){
    // if(event.detail === 1){
    //   props.onClick(props.post.id);
    // }
    if(event.detail === 2){
      if(session){
        await setDoc(doc(db, "posts", postId, "likes", session.user.email), {
          userEmail: session.user.email,
        });
        
        setVisibleLoveIcon(true);
        setTimeout(() => {
          setVisibleLoveIcon(false);
        }, 700);
      }
    }
  }

  return (
    <>
        <Modal
          isOpen={visiblePostEditModal}
          onRequestClose={() => {
            togglePostEditModal();
          }}
          className={styles.postEditModal}
          ariaHideApp={false}
          style={customStyles}
          closeTimeoutMS={700}
        >
          <div className={styles.postModalEditList}>
          {session && session.user.email === postData.email && (
            <li className={styles.modalDeleteBtn} onClick={handleDeletePost}>Delete</li>
          )}
            <li onClick={()=>{props.onClick(props.post.id); setVisiblePostEditModal(false);}}>View Post</li>
            <li onClick={handleShareWhatsapp}>Share via WhatsApp</li>
            <li onClick={()=>{props.onCopy(props.post.id); setVisiblePostEditModal(false);}}>Copy Link</li>
            <li onClick={togglePostEditModal}>Cancel</li>
          </div>
        </Modal>

        {/* Modals to show who have liked this post -------------------------------------- */}
        <Modal
          isOpen={visibleLikeModal}
          onRequestClose={() => {
            toggleLikeModal();
          }}
          className={styles.likeModal}
          ariaHideApp={false}
          style={customStyles}
          closeTimeoutMS={700}
        >
          <p className={styles.likeHeading}>Likes</p>
          <div className={styles.likeList}>
            {
              likes.map((like)=>
                ( 
                <li className={styles.likeUserdata} key={like.id}>
                  <div>{like.data().userEmail.split("@")[0]}</div>
                  <button onClick={()=>{router.push(`/${like.data().userEmail.split("@")[0]}`)}}>View Profile</button>
                </li>)
              )
            }
          </div>
        </Modal>

      <div className={styles.post}>
        <div className={styles.authorDetails}>
          <Image
            src={postAuthorDp? postAuthorDp : postData.dp}
            height={42}
            width={42}
            alt="post_dp"
            draggable="false"
            className={styles.postDp}
            onClick={()=>{goToProfileHandler(postData.email.split("@")[0])}}
          />
          <div className={styles.authorNameEmail}>
            <div 
            onClick={()=>{goToProfileHandler(postData.email.split("@")[0])}}
            >
              {postData.name}</div> <div>{postData.email}</div>
          </div>

          <BsThreeDots className={styles.deleteIcon} onClick={togglePostEditModal} />
        </div>
        <div className={styles.imageBox} onClick={handleClickOnPostImage}>
          <Image
            src={postData.image}
            height={200}
            width={200}
            alt="post"
            draggable="false"
            className={styles.postImage}
          />
          {session && hasLiked &&
              <MdFavorite className={visibleLoveIcon? "loveVisibleIcon loveVisible": "loveVisibleIcon"}/>
          }
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
            <FaRegCommentAlt className={styles.commentIcon} onClick={toggleVisibleCommentBox} />
            <BsWhatsapp className={styles.whatsappIcon} onClick={handleShareWhatsapp}/>
          </div>
        )}
        <div className={styles.likeCounts}>
          {likes.length > 0 && <div onClick={toggleLikeModal} className={styles.likeText}>{likes.length} {likes.length===1?"like":"likes"}</div>}
          <div>{timeDiff}</div>
        </div>
        <div className={styles.commentSection}>
          {comments.map((comment) => {
            return (
              <div className={styles.comment} key={comment.id}>
                <div className={styles.commentLeft}>
                  <div>
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
        {session && visibleCommentBox && (
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
