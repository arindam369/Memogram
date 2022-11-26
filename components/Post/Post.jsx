import React from 'react'
import styles from "../../styles/Home.module.css";
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {MdOutlineFavoriteBorder} from "react-icons/md"
import {FaRegCommentAlt} from "react-icons/fa"
import {BsWhatsapp, BsEmojiSmile} from "react-icons/bs"

export default function Post() {
    const {data: session} = useSession();

  return (
    <>
        <div className={styles.post}>
            <div className={styles.authorDetails}>
                {session && <Image src={session.user.image} height={42} width={42} alt="post_dp" className={styles.postDp}/>}
                {session && <div className={styles.authorNameEmail}><div>{session.user.name}</div> <div>{session.user.email}</div></div>}
            </div>
            <div className={styles.imageBox}>
                <Image src="https://firebasestorage.googleapis.com/v0/b/insta-v4.appspot.com/o/posts%2Fdv7gVNlxMd2NM2mQnO9F%2Fimage?alt=media&token=afcb8ef1-6caf-4fb4-ab88-ade24df12bf5" height={200} width={200} alt="post" className={styles.postImage} objectFit="cover"/>
            </div>
            <div className={styles.postCaption}>
                Awesome food, I am eating Now.
            </div>
            <div className={styles.likeCommentShare}>
                <MdOutlineFavoriteBorder className={styles.loveIcon}/>
                <FaRegCommentAlt className={styles.commentIcon}/>
                <BsWhatsapp className={styles.whatsappIcon}/>
            </div>
            <div className={styles.likeCounts}>
                <div>356 likes</div>
            </div>
            <div className={styles.commentSection}>
                <div className={styles.comment}>
                    <div className={styles.commentLeft}>
                        <div className={styles.commentAuthorName}>gojosatoru</div>
                        <div className={styles.commentAuthorMessage}>Nice picture</div>
                    </div>
                    <div className={styles.commentRight}>
                        17 hours ago
                    </div>
                </div>
                <div className={styles.comment}>
                    <div className={styles.commentLeft}>
                        <div className={styles.commentAuthorName}>arindam369</div>
                        <div className={styles.commentAuthorMessage}>Awesome</div>
                    </div>
                    <div className={styles.commentRight}>
                        2 days ago
                    </div>
                </div>
            </div>
            {session && 
            <div className={styles.commentForm}>
                <form>
                    <BsEmojiSmile className={styles.emojiIcon}/>
                    <input type="text" placeholder='Add a comment...'/>
                    <button>Post</button>
                </form>
            </div>}
        </div>
    </>
  )
}
