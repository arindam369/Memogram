import React, { useState, useRef, useEffect } from "react";
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
import { ref, uploadBytesResumable } from "firebase/storage";
import Progress from "../components/Progress/Progress";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function HomePage() {
  const { data: session } = useSession();
  // console.log(session);

  const [visibleModal, setVisibleModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(()=>{
    const unsubscribe = onSnapshot(query(collection(db, "posts"), orderBy("timestamp", "desc")), (snapshot)=>{
      setPosts(snapshot.docs);
    })
    return unsubscribe;
  },[])



  function handleFileChange(e) {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setImageFile(readerEvent.target.result);
      setFile(e.target.files[0]);
    };
  }

  async function handlePost() {
    const { name, lastModified } = file;
    const filePath = `assets/${name}_${lastModified}`;
    const folderRef = ref(storage, filePath);

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

  return (
    <>
      <Navbar
        onCreate={() => {
          setVisibleModal(true);
        }}
      />

      <div className={styles.homeContainer}>
        <div className={styles.feeds}>
          {
            posts.map((post)=>{
              return (
                <Post post={post} key={post.id}/>
              )
            })
          }
        </div>
        <div className={styles.account}>
          <Account />
        </div>
      </div>

      {visibleModal && (
        <Modal
          isOpen={visibleModal}
          onRequestClose={() => {
            setVisibleModal(false);
          }}
          className={styles.modal}
          ariaHideApp={false}
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
      )}
    </>
  );
}
