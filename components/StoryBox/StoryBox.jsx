import { addDoc, collection, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db, storage } from "../../firebase";
import styles from "./../../styles/Home.module.css";
import Image from "next/image";

import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useSession } from "next-auth/react";
import { getProfileData } from "../../helper/api-utils";
import Modal from "react-modal";
import Progress from "../Progress/Progress";
import { getDownloadURL, ref as ref_storage, uploadBytesResumable, deleteObject } from "firebase/storage";
import { RiDeleteBack2Fill } from "react-icons/ri";
import Swal from "sweetalert2";
import { getTimestampDifference_inSeconds } from "../../helper/timestamp-utils";

export default function StoryBox(){

    const [stories, setStories] = useState(null);
    const [storyAuthorDp, setStoryAuthorDp] = useState(null);
    const { data: session } = useSession();
    const [visiblleAddStoryModal, setVisibleAddStoryModal] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [file, setFile] = useState(null);
    const fileRef = useRef(null);
    
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState("");
    const [imgError, setImgError] = useState(false);
    const [storyVisibleFullScreen, setStoryVisibleFullScreen] = useState(false);
    const [storyData, setStoryData] = useState(null);

    useEffect(()=>{
        async function getPostUserDp(){
          if(session){
            const postProfileData = await getProfileData(session.user.email.split("@")[0]);
            const postProfileDp = postProfileData && await postProfileData.dp;
            setStoryAuthorDp(postProfileDp);
          }
        }
        getPostUserDp();
    }, [storyAuthorDp, session])

    useEffect(()=>{
        // Whenever the story will be 1 day old it will be automatically deleted
        async function deleteStoryAutomatically(){
            if(stories){
                stories.forEach(async (story)=>{
                    const foundTimestamp = story.data().timestamp ? story.data().timestamp.seconds : new Date().getTime() / 1000;
                    const requiredTimeDiff = getTimestampDifference_inSeconds(foundTimestamp);
                    if(requiredTimeDiff>86400){
                        var fileRef = ref_storage(storage, story.data().image);
                        await deleteObject(fileRef).then(async ()=>{
                            await deleteDoc(doc(db, "stories", story.id));
                        });
                    }
                })
            }
        }
        deleteStoryAutomatically();
    },[stories])

    useEffect(()=>{
        const unsubscribe2 = onSnapshot(query(collection(db, "stories"), orderBy("timestamp", "desc")), (snapshot)=>{
          setStories(snapshot.docs);
        })
        return unsubscribe2;
    },[])

    function showAddStoryModal(){
        setVisibleAddStoryModal(true);
    }

    const customStyles = {
        overlay:{
          background: "rgba(0,0,0,0.65)",
          zIndex: "100"
        }
    };

    // story upload modal functions -----------------------------------
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
        const filePath = `storyAssets/${name}_${lastModified}`;

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
                setVisibleAddStoryModal(false);
                setCaption("");
              }, 1000);
            }
          },
          (error) => {
            console.log(error);
          },
          () => {
            getDownloadURL(uploadedFile.snapshot.ref).then(async (downloadUrl) => {
              await addDoc(collection(db, "stories"), {
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

    //   view story in full screen
    function toggleStoryFullScreen(){
        setStoryVisibleFullScreen(!storyVisibleFullScreen);
    }

    // delete story
    async function handleDeleteStory() {
        Swal.fire({
          title: "Are you sure?",
          text: "Do you want to really delete this story?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
          if (result.isConfirmed) {
            Swal.fire("Deleted!", "Your story has been deleted.", "success");
            var fileRef = ref_storage(storage, storyData.data().image);
            await deleteObject(fileRef).then(async ()=>{
                await deleteDoc(doc(db, "stories", storyData.id));
            });
            setStoryVisibleFullScreen(false);
          }
        });
      }

    return (
        <>
        <Modal
          isOpen={visiblleAddStoryModal}
          onRequestClose={() => {
            setVisibleAddStoryModal(false);
          }}
          className={styles.modal}
          ariaHideApp={false}
          style={customStyles}
        >
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

        </Modal>


        <div className={styles.storyContainer}>
            <Swiper
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                spaceBetween={20}
                // slidesPerView={7}
                breakpoints={{
                    // when window width is >= 768px
                    1100: {
                        slidesPerView: 7
                    },
                    1000: {
                        slidesPerView: 6
                    },
                    900: {
                        slidesPerView: 6
                    },
                    440: {
                        slidesPerView: 5
                    },
                    200: {
                        slidesPerView: 4
                    },
                }}
                // navigation
                pagination={{ clickable: true }}
                // scrollbar={{ draggable: true }}
                onSwiper={(swiper) => console.log(swiper)}
                onSlideChange={() => console.log('slide change')}
                >
                {session && storyAuthorDp && <SwiperSlide className={styles.storyBox + " "+styles.myStoryDiv}>
                    <Image src={storyAuthorDp} height={150} width={150} alt="story" className={styles.storyImage} onClick={showAddStoryModal}/>
                    <Image src="/images/plus.png" alt="addStoryIcon" height={16} width={16} className={styles.addStoryIcon}/>
                    <div className={styles.storyAuthor}>Your Story</div>
                </SwiperSlide>}

                {stories && stories.map((story)=>{
                    let storyAuthorName = story.data().email.split("@")[0].trim();
                    if(storyAuthorName.length>10){
                        storyAuthorName = storyAuthorName.substr(0,10)+"...";
                    }

                    return (
                        <SwiperSlide className={styles.storyBox} key={story.id}>
                            <Image src={story.data().image} height={150} width={150} alt="story" className={styles.storyImage} onClick={()=>{
                                setStoryData(story);
                                toggleStoryFullScreen();
                            }}/>
                            <div className={styles.storyAuthor}>{storyAuthorName}</div>
                        </SwiperSlide>
                    )
                })}
            </Swiper>


            <Modal
                isOpen={storyVisibleFullScreen}
                onRequestClose={() => {
                    toggleStoryFullScreen();
                    setStoryData(null);
                }}
                className={styles.postFullscreenModal}
                ariaHideApp={false}
                style={customStyles}
                closeTimeoutMS={200}
                >
                { storyData && <div className={styles.postModalEditList}>
                    <Image
                        src={storyData.data().image}
                        height={200}
                        width={200}
                        alt="story"
                        className={styles.myPostFullscreenImage}
                    />
                    <div className={styles.storyCaption}>{storyData.data().caption}</div>
                    {session && session.user.email === storyData.data().email &&
                    <RiDeleteBack2Fill className={styles.storyDeleteIcon} onClick={handleDeleteStory}/>}
                </div>}
            </Modal>
        </div>
        </>
    );
}