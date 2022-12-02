import { useRouter } from "next/router";
import Navbar from "../../components/Navbar/Navbar";
import {doc, collection, onSnapshot, orderBy, query, where, getDoc} from "firebase/firestore";
import { db } from "../../firebase";
import { useState, useEffect } from "react";
import Post from "../../components/Post/Post";
import styles from "../../styles/Home.module.css";
import Head from "next/head";

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

    return (
        <>
            <Head>
                <link rel="manifest" href="../manifest.json" />
                <link rel="icon" type="image/x-icon" href="../favicon.ico" />
                <title>Memogram | Post</title>
            </Head>
            <Navbar disableCreatePost="true"/>
            <div className={styles.postContainer}>
                <div className={styles.feeds}>
                    {post && <Post post={post} onClick={handleOnClickPost}/>
                    
                    }
                    {postNotFound && <div className={styles.errorBox}>
                        <h3 className={styles.error}>Post Not Found</h3>
                    </div>}
                </div>
            </div>
        </>
    );
}