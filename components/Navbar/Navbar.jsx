import React, { useEffect, useState } from "react";
import { ImHome } from "react-icons/im";
import { IoIosAddCircleOutline } from "react-icons/io";
import Link from "next/link";
import styles from "../../styles/Home.module.css";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { getProfileData } from "../../helper/api-utils";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/router";

export default function Navbar(props) {
  const { data: session } = useSession();
  const [postAuthorDp, setPostAuthorDp] = useState(null);
  const router = useRouter();

  const [visibleDropdown, setVisibleDropdown] = useState(false);

  function goToProfileHandler(){
    if(session){
      const username = session.user.email.split("@")[0];
      router.push(`/${username}`);
      setVisibleDropdown(false);
    }
  }

  useEffect(() => {
    async function getPostUserDp() {
      if (session) {
        const postProfileData = await getProfileData(
          session.user.email.split("@")[0]
        );
        const postProfileDp = postProfileData && (await postProfileData.dp);
        setPostAuthorDp(postProfileDp);
      }
    }
    getPostUserDp();
  }, [postAuthorDp, session]);

  return (
    <>
      <div className={styles.navbarContainer}>
        <div className={styles.leftPart}>
          <Link href="/"> Memogram </Link>
        </div>
        <div className={styles.rightPart}>
          {props.disableCreatePost === "true" ? (
            ""
          ) : (
            <IoIosAddCircleOutline
              className={styles.addPost}
              onClick={() => {
                props.onCreate();
              }}
            />
          )}
          <Link href="/">
            <ImHome className={styles.homeIcon} />
          </Link>
          <div>
            {!session && (
              <Link href="/auth/signIn" className={styles.signinBtn}>
                Sign In
              </Link>
            )}
            {session && (
              <div className={styles.userDp}>
                <Image
                  src={postAuthorDp ? postAuthorDp : session.user.image}
                  width={48}
                  height={48}
                  alt="user_dp"
                  className={styles.dp}
                  onClick={()=>{setVisibleDropdown(!visibleDropdown)}}
                />
                {visibleDropdown && <div className={styles.dropdownContent}>
                  <div onClick={goToProfileHandler}>
                    <FaUserCircle className={styles.dropdownIcons} /> My Profile
                  </div>
                  <div onClick={() => {
                        setVisibleDropdown(false);
                        signOut({ callbackUrl: "/auth/signIn" });
                      }}>
                    <FaSignOutAlt
                      className={styles.dropdownIcons}
                    />
                    Logout
                  </div>
                </div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
