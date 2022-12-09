import { useRouter } from "next/router";
import Navbar from "../../components/Navbar/Navbar";
import {doc, collection, onSnapshot, orderBy, query, where, getDoc} from "firebase/firestore";
import { db } from "../../firebase";
import { useState, useEffect } from "react";
import Post from "../../components/Post/Post";
import styles from "../../styles/Home.module.css";
import Head from "next/head";
import Swal from "sweetalert2";

export default function PostPage(){
    const router = useRouter();
    const postId = router.query.postid;
    const [post, setPost] = useState(null);
    const [postNotFound, setPostNotFound] = useState(false);

    useEffect(()=>{
        if(postId){
            getPostData();
        }
    },[postId])

    async function getPostData(){
        const docRef = doc(db, "posts", postId);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()) {
            setPostNotFound(false);
            setPost(docSnap);
        } else {
            setPost(null);
            setPostNotFound(true);
        }
    }

    function handleOnClickPost(){
        return;
    }

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })

    function copyToClipboard(postId){
        navigator.clipboard.writeText(`https://memogram-nine.vercel.app/posts/${postId}`)
        Toast.fire({
          icon: 'success',
          title: 'Copied to Clipboard'
        })
      }

    return (
        <>
            <Head>
                <link rel="manifest" href="../manifest.json" />
                <link rel="icon" type="image/x-icon" href="../favicon.ico" />
                <title>Memogram | Post</title>
                {post? <link rel="icon" type="image/x-icon" href={post.data().image} /> : <link rel="icon" type="image/x-icon" href="https://memogram-nine.vercel.app/favicon.ico" />}
                <meta property="og:image:width" content="400" />
                <meta property="og:image:height" content="300" />
                {post && <meta property="og:title" content={post.data().name} />}
                {post && <meta
                    property="og:description"
                    content={post.data().caption}
                />}
            </Head>
            <Navbar disableCreatePost="true"/>
            <div className={styles.postContainer + " "+styles.deleteMarginTop}>
                <div className={styles.feeds}>
                    {post && <Post post={post} onClick={handleOnClickPost} onCopy={copyToClipboard}/>}
                    {postNotFound && <div className={styles.errorBox}>
                        <h3 className={styles.error}>Post Not Found</h3>
                    </div>}
                </div>
            </div>
        </>
    );
}