import styles from "../../styles/Home.module.css";
import Image from "next/image";
import {MdFavorite} from "react-icons/md"
import {FaCommentAlt} from "react-icons/fa"
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import Modal from "react-modal";
import { useRouter } from "next/router";

export default function PostImage(props) {

    const postData = props.post.data();
    const postId = props.post.id;
    const [likes, setLikes] = useState([]);
    const [comments, setComments] = useState([]);
    const [postVisibleFullScreen, setPostVisibleFullScreen] = useState(false);


    useEffect(()=>{
      onSnapshot(collection(db, "posts", postId, "likes"), (snapshot) => {
        setLikes(snapshot.docs);
      });
      onSnapshot(collection(db, "posts", postId, "comments"), (snapshot) => {
        setComments(snapshot.docs);
      });
    }, [])

    function toggleFullScreen(){
      setPostVisibleFullScreen(!postVisibleFullScreen);
    }

    const customStyles = {
      overlay:{
        background: "rgba(0,0,0,0.65)",
        zIndex: "100"
      }
    };
    const router = useRouter();
    
    function goToPost(){
      router.push(`/posts/${postId}`);
    }

  return (
    <>
      <Modal
          isOpen={postVisibleFullScreen}
          onRequestClose={() => {
            toggleFullScreen();
          }}
          className={styles.postFullscreenModal}
          ariaHideApp={false}
          style={customStyles}
          closeTimeoutMS={200}
        >
          <div className={styles.postModalEditList}>
          <Image
            src={postData.image}
            height={200}
            width={200}
            alt="post"
            className={styles.myPostFullscreenImage}
          />
          <div className={styles.myPostTextData}>
            <div className={styles.myPostFullscreenCaption}>
              {postData.caption}
            </div>
            <div className={styles.myPostBottomPart}>
              <div className={styles.myPostFullscreenCommentCounts}>
                <div> <div><MdFavorite className={styles.myPostLove}/></div> <div>{likes.length}</div>  </div>
                <div> <div><FaCommentAlt className={styles.myPostComment}/></div> <div> {comments.length} </div> </div>
              </div>
              <div className={styles.viewPost} onClick={goToPost}>View Post</div>
            </div>
          </div>
            
          </div>
        </Modal>

      <div className={styles.myPost} onClick={toggleFullScreen}>
        <div className={styles.myImageBox} onClick={()=>{props.onClick(props.post.id);}}>
          <Image
            src={postData.image}
            height={200}
            width={200}
            alt="post"
            className={styles.myPostImage}
          />
        </div>

        <div className={styles.myLikeCommentCaption}>
          <div className={styles.myLikeCommentCounts}>
            <div> <MdFavorite className={styles.myPostLove}/> <div>{likes.length}</div>  </div>
            <div> <FaCommentAlt className={styles.myPostComment}/> <div> {comments.length} </div> </div>
          </div>
          <div className={styles.myCaption}>
            {postData.caption}
          </div>
        </div>

      </div>
    </>
  );
}
