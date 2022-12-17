import Navbar from "../components/Navbar/Navbar";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import { BsFillGridFill } from "react-icons/bs";
import { getAllProfiles, getProfileData } from "../helper/api-utils";
import { useState, useEffect, useRef } from "react";
import PostImage from "../components/Post/PostImage";
import { collection, onSnapshot, orderBy, where } from "firebase/firestore";
import { query } from "firebase/database";
import { db } from "../firebase";
import { useSession } from "next-auth/react";
import Modal from "react-modal";
import { getDatabase, ref as ref_database, set } from "firebase/database";
import Progress from "../components/Progress/Progress";
import { storage } from "../firebase";
import { getDownloadURL } from "firebase/storage";
import { ref as ref_storage, uploadBytesResumable } from "firebase/storage";

export default function ProfilePage(props) {
  const { profileData } = props;

  // console.log(profileData);

  const [userPosts, setUserPosts] = useState([]);
  const [visibleEditProfileModal, setVisibleEditProfileModal] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [file, setFile] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [bio, setBio] = useState(null);
  const [progress, setProgress] = useState(0);
  const [profileDp, setProfileDp] = useState("");


  useEffect(() => {
    if(profileData){
      setProfileDp(profileData.dp);
      setBio(profileData.bio);
    }
  }, []);

  useEffect(()=>{
    async function getPostUserDp(){
      if(profileData){
        const postProfileData = await getProfileData(profileData.email.split("@")[0]);
        const postProfileDp = postProfileData && await postProfileData.dp;
        setProfileDp(postProfileDp);
      }
    }
    getPostUserDp();
  }, [])

  const database = getDatabase();

  const fileRef = useRef(null);
  function handleFileChange(e) {
    const fileName = e.target.files[0].name;
    const fileTypeArray = fileName.split(".");
    const fileMimeType = fileTypeArray[fileTypeArray.length - 1];
    if (
      fileMimeType === "JPG" ||
      fileMimeType === "jpg" ||
      fileMimeType === "PNG" ||
      fileMimeType === "png" ||
      fileMimeType === "jfif" ||
      fileMimeType === "JFIF" ||
      fileMimeType === "JPEG" ||
      fileMimeType === "jpeg"
    ) {
      setImgError(false);
      const reader = new FileReader();
      if (e.target.files[0]) {
        reader.readAsDataURL(e.target.files[0]);
      }
      reader.onload = (readerEvent) => {
        setImageFile(readerEvent.target.result);
        setFile(e.target.files[0]);
      };
    } else {
      setImgError(true);
      return;
    }
  }
  async function modifyProfile() {
    if (file) {
      const { name, lastModified } = file;
      const filePath = `assets/${name}_${lastModified}`;
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
              setVisibleEditProfileModal(false);
            }, 1000);
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadedFile.snapshot.ref).then(
            async (downloadUrl) => {
              const username = session.user.email.split("@")[0];
              set(ref_database(database, "profiles/" + username), {
                name: session.user.name,
                email: session.user.email,
                dp: downloadUrl,
                bio: bio,
              })
                .then(() => {
                  // console.log("Data updated successfully!");
                  // toast.success("Data updated successfully");
                  setProfileDp(downloadUrl);
                })
                .catch((error) => {
                  console.log("The write failed...");
                });
            }
          );
        }
      );
    }
    else{
      const username = session.user.email.split("@")[0];
      set(ref_database(database, "profiles/" + username), {
        name: session.user.name,
        email: session.user.email,
        dp: profileData.dp,
        bio: bio,
      })
        .then(() => {
          // console.log("Data updated successfully!");
          setVisibleEditProfileModal(false);
        })
        .catch((error) => {
          console.log("The write failed...");
        });
    }
  }

  useEffect(() => {
    if(profileData){
      const unsubscribe = onSnapshot(
        query(collection(db, "posts"), where("email", "==", profileData.email)),
        (snapshot) => {
          const sortedArray = snapshot.docs.sort((a,b)=>{
            const currTime = new Date().getTime()/1000;
            return a.data().timestamp-currTime < b.data().timestamp-currTime?1:-1;
          })
          setUserPosts(sortedArray);
        }
      );
      return unsubscribe;
    }
  }, []);

  const { data: session } = useSession();

  function toggleEditProfile() {
    setBio(profileData.bio);
    setVisibleEditProfileModal(!visibleEditProfileModal);
  }
  const customStyles = {
    overlay: {
      background: "rgba(0,0,0,0.65)",
      zIndex: "100",
    },
  };


  return (
    <>
      <Modal
        isOpen={visibleEditProfileModal}
        onRequestClose={() => {
          toggleEditProfile();
        }}
        className={styles.editProfileModal}
        ariaHideApp={false}
        style={customStyles}
      >
        <div className={styles.editProfileDiv}>
          <h4>Edit Profile</h4>
          <div className={styles.editProfileImageBox}>
            {imageFile ? (
              <Image
                src={imageFile}
                height={230}
                width={300}
                alt="uploadedImage"
                onClick={() => {
                  setImageFile(null);
                }}
                className={styles.editProfileDp}
              />
            ) : (
              <Image
                src={profileDp}
                height={230}
                width={300}
                alt="uploadedImage"
                onClick={() => {
                  fileRef.current.click();
                }}
                className={styles.editProfileDp}
              />
            )}
          </div>
          <input type="file" hidden ref={fileRef} onChange={handleFileChange} />
          <h6 className={styles.imgError2}>
            {imgError &&
              "Sorry, only jpg/jpeg/png/jfif images are allowed"}{" "}
          </h6>
          <div>
            <input
              type="text"
              placeholder="Add a Bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
              }}
            />
          </div>
          {progress > 0 && <div className={styles.editProgress}> <Progress progress={progress} className={styles.editProgress}/> </div>}
          <button onClick={modifyProfile}>
            Save
          </button>
        </div>
      </Modal>

      <Navbar disableCreatePost="true" />
      {profileData && <div className={styles.profilePage}>
        <div className={styles.profileContainer}>
          <div className={styles.profileLeft}>
            {profileData && (
              <Image
                src={profileDp? profileDp: profileData.dp}
                width={300}
                height={300}
                alt="dp"
                className={styles.profileDp}
              />
            )}
            {profileData && (
              <h4 className={styles.profileUsername}>
                {profileData.email.split("@")[0]}
              </h4>
            )}
          </div>

          <div className={styles.profileRight}>
            {session && profileData && session.user.email === profileData.email && (
              <div className={styles.editProfile}>
                <button
                  className={styles.editProfileBtn}
                  onClick={toggleEditProfile}
                >
                  Edit Profile
                </button>
              </div>
            )}
            {/* <div className={styles.postFollowerFollowing}>
              <div className={styles.postFollowerFollowingData}>
                {" "}
                <b>155</b> posts
              </div>
              <div className={styles.postFollowerFollowingData}>
                {" "}
                <b>678</b> followers
              </div>
              <div className={styles.postFollowerFollowingData}>
                {" "}
                <b>500</b> following
              </div>
            </div> */}

            <div className={styles.profileDetails}>
              <div className={styles.profileData}>
                {profileData && (
                  <div className={styles.profileUserNameData}>
                    {profileData.name}
                  </div>
                )}
                <div className={styles.profileUserBio}>
                  {/* IT&apos;24, Jadavpur University */}
                  {bio ? bio: profileData && profileData.bio}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>}

      {!profileData && 
            <div className={styles.profileNotFoundPage}>
              <div className={styles.profileNotFound}>
                <Image src="/images/errorPage.png" height={300} width={300} alt="profileNotFound" className={styles.profileErrorImage}></Image>
                <div className={styles.profileError}>
                  <h2>Profile Not Found</h2>
                  <h5>Sorry, but we can&apos;t find the profile you are looking for . . .</h5>
                </div>
              </div>
            </div>
      }

      {profileData && 
      <div className={styles.myPostContainer}>
        <div className={styles.myPostHeading}>
          <BsFillGridFill />
          <h4>My Posts</h4>
        </div>

        <div className={styles.myFeeds}>
          {userPosts.map((post) => {
            return <PostImage post={post} key={post.id} />;
          })}
        </div>
      </div>
      }
    </>
  );
}

export async function getStaticProps(context) {
  const { params } = context;
  const username = params.username;
  const profileData = await getProfileData(username);
  const notFound = profileData ? false : true;

  return { props: { profileData: profileData || null} };
}
export async function getStaticPaths() {
  const profilesArray = await getAllProfiles();
  const profile_path = await profilesArray.map((profile) => ({
    params: { username: profile.email && profile.email.split("@")[0] },
  }));

  return {
    paths: profile_path,
    fallback: true,
  };
}
