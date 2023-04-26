import React, { useState, useRef, useEffect, useContext } from "react";
import { useSession } from "next-auth/react";
import styles from "../styles/Home.module.css";
import Post from "../components/Post/Post";
import Account from "../components/Account/Account";
import Navbar from "../components/Navbar/Navbar";
import Modal from "react-modal";
import Image from "next/image";
import Link from "next/link";
import { storage } from "../firebase";
import { getDownloadURL } from "firebase/storage";
import { ref as ref_storage, uploadBytesResumable } from "firebase/storage";
import Progress from "../components/Progress/Progress";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Router from "next/router";
import Head from "next/head";
import {getDatabase, ref as ref_database, set} from "firebase/database";
import Swal from "sweetalert2";
import { getProfileData } from "../helper/api-utils";
import StoryBox from "../components/StoryBox/StoryBox";
import SkeletonPost from "../skeletons/SkeletonPost";

export default function HomePage() {
  const { data: session } = useSession();
  const [visibleModal, setVisibleModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState("");
  const [posts, setPosts] = useState(null);
  const [imgError, setImgError] = useState(false);

  const database = getDatabase();

  useEffect(()=>{
    const unsubscribe = onSnapshot(query(collection(db, "posts"), orderBy("timestamp", "desc")), (snapshot)=>{
      setPosts(snapshot.docs);
    })
    return unsubscribe;
  },[])

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


  const customStyles = {
    overlay:{
      background: "rgba(0,0,0,0.65)",
      zIndex: "100"
    }
  };

  // store data if session changes
  // we will store user profile where key=emailID
  useEffect(()=>{
    async function addProfileData(session){
      const username = session.user.email.split("@")[0].replace(/[.+-]/g, "_");
      await getProfileData(session.user.email.split("@")[0].replace(/[.+-]/g, "_")).then((profileArray)=>{
        if(!profileArray){
          set(ref_database(database, 'profiles/'+username), {
            name: session.user.name,
            email: session.user.email,
            dp: session.user.image
          })
          .then(() => {
            console.log("Data saved successfully!");
          })
          .catch((error) => {
            console.log("The write failed...");
          });
        }
      });
    }
    if(session){
      addProfileData(session);
    }
    
  }, [])



  function handleFileChange(e) {
    const fileName = e.target.files[0].name;
    const fileTypeArray = fileName.split(".");
    const fileMimeType = fileTypeArray[fileTypeArray.length-1];
    if(fileMimeType==="JPG" || fileMimeType==="jpg" || fileMimeType==="PNG" || fileMimeType==="png" || fileMimeType==="jfif" || fileMimeType==="JFIF" || fileMimeType==="JPEG"||fileMimeType==="jpeg"){
      setImgError(false);
      const reader = new FileReader();
      if (e.target.files[0]) {
        reader.readAsDataURL(e.target.files[0]);
      }
      reader.onload = (readerEvent) => {
        setImageFile(readerEvent.target.result);
        setFile(e.target.files[0]);
      };
    }
    else{
      setImgError(true);
      return;
    }
  }

  async function handlePost() {
    const { name, lastModified } = file;
    const filePath = `assets/${name}_${new Date().getTime()}`;
    const folderRef = ref_storage(storage, filePath);

    const uploadedFile = uploadBytesResumable(folderRef, file);
    uploadedFile.on(
      "state_changed",
      (snapshot) => {
        setProgress(
          Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        );
        if (snapshot.bytesTransferred === snapshot.totalBytes) {
          setTimeout(() => {
            setProgress(0);
            setFile(null);
            setImageFile(null);
            setVisibleModal(false);
            setCaption("");
          }, 1000);
        }
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadedFile.snapshot.ref).then(async (downloadUrl) => {
          await addDoc(collection(db, "posts"), {
            name: session.user.name,
            email: session.user.email,
            dp: session.user.image,
            caption: caption,
            timestamp: serverTimestamp(),
            image: downloadUrl
          });
        });
      }
    );
  }

  function handleOnClickPost(postId){
    Router.push(`/posts/${postId}`)
  }
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
        <link rel="manifest" href="manifest.json" />
      </Head>
      <Navbar
        disableCreatePost="false"
        onCreate={() => {
          setVisibleModal(true);
        }}
      />

      <StoryBox/>

      {/* skeleton ---------------- */}
      {!posts && 
      <div className={styles.homeContainer}>
        <div className={styles.feeds}>
          <SkeletonPost/>
          <SkeletonPost/>
          <SkeletonPost/>
        </div>
      </div>}

      <div className={styles.homeContainer}>
        <div className={styles.feeds}>
          {
            posts && posts.map((post)=>{
              return (
                <Post post={post} key={post.id} onClick={handleOnClickPost} onCopy={copyToClipboard}/>
              )
            })
          }
        </div>
        <div className={styles.account}>
          <Account />
        </div>
      </div>

        <Modal
          isOpen={visibleModal}
          onRequestClose={() => {
            setVisibleModal(false);
          }}
          className={styles.modal}
          ariaHideApp={false}
          style={customStyles}
          closeTimeoutMS={700}
        >
          {session && (
            <>
              <div className={styles.uploadedImageBox}>
                {!imageFile ? (
                  <Image
                    src="/images/gallery.png"
                    width={80}
                    height={80}
                    alt="imageUpload"
                    className={styles.imageIcon}
                    onClick={() => {
                      fileRef.current.click();
                    }}
                  />
                ) : (
                  <Image
                    src={imageFile}
                    height={230}
                    width={300}
                    alt="uploadedImage"
                    onClick={() => {
                      setImageFile(null);
                    }}
                    className={styles.uploadedImage}
                  />
                )}
              </div>
              <input
                type="file"
                hidden
                ref={fileRef}
                onChange={handleFileChange}
              />
              <h6 className={styles.imgError}> {imgError && "Sorry, only jpg/jpeg/png/jfif images are allowed"} </h6>
              <input
                type="text"
                placeholder="Write a caption . . ."
                value={caption}
                onChange={(e) => {
                  setCaption(e.target.value);
                }}
              />
              {progress > 0 && <Progress progress={progress} />}
              <button
                onClick={handlePost}
                disabled={!imageFile || caption.trim().length === 0}
              >
                Post
              </button>
            </>
          )}
          {!session && (
            <Link href="/auth/signIn">
              <div className={styles.signInButton}>Sign In to Post</div>
            </Link>
          )}
        </Modal>
    </>
  );
}
