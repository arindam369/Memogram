import Navbar from "../components/Navbar/Navbar";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import {BsFillGridFill} from "react-icons/bs";
import { getAllProfiles, getProfileData } from "../helper/api-utils";

export default function ProfilePage(props){
    const {profileData} = props;

    // console.log(profileData);
    return (
        <>
            <Navbar disableCreatePost="true"/>
            <div className={styles.profilePage}>
                <div className={styles.profileContainer}>
                    <div className={styles.profileLeft}>
                        {profileData && <Image src={profileData.dp} width={300} height={300} alt="dp" className={styles.profileDp}/>}
                        {profileData && <h4 className={styles.profileUsername}> {profileData.email.split("@")[0]} </h4>} 
                    </div>

                    <div className={styles.profileRight}>
                        <div className={styles.postFollowerFollowing}>
                            <div className={styles.postFollowerFollowingData}> <b>155</b> posts</div>
                            <div className={styles.postFollowerFollowingData}> <b>678</b> followers</div>
                            <div className={styles.postFollowerFollowingData}> <b>500</b> following</div>
                        </div>

                        <div className={styles.profileDetails}>
                            <div className={styles.profileData}>
                                {profileData && <div className={styles.profileUserNameData}>{profileData.name}</div>}
                                <div className={styles.profileUserBio}>IT&apos;24, Jadavpur University</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.myPostContainer}>
                <div className={styles.myPostHeading}>
                    <BsFillGridFill/>
                    <h4>My Posts</h4>
                </div>

            </div>
        </>
    );
}

export async function getStaticProps(context) {
    const { params } = context;
    const username = params.username;
    const profileData = await getProfileData(username);
    const notFound = profileData ? false : true;
  
    return { props: { profileData: profileData }, notFound };
}
export async function getStaticPaths() {
    const profilesArray = await getAllProfiles();
    const profile_path = await profilesArray.map((profile) => ({
      params: { username: profile.email.split("@")[0] },
    }));

    return {
      paths: profile_path,
      fallback: true,
    };
}