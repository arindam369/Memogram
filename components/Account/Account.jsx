import React, { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getProfileData } from "../../helper/api-utils";
import {GoSearch} from "react-icons/go";

export default function Account() {
  const { data: session } = useSession();
  const router = useRouter();

  function goToProfileHandler(username){
    router.push(`/${username}`);
  }
  const [postAuthorDp, setPostAuthorDp] = useState(null);

  useEffect(()=>{
    async function getPostUserDp(){
      if(session){
        const postProfileData = await getProfileData(session.user.email.split("@")[0]);
        const postProfileDp = postProfileData && await postProfileData.dp;
        setPostAuthorDp(postProfileDp);
      }
    }
    getPostUserDp();
  }, [postAuthorDp, session])

  const [username, setUsername] = useState("");
  function handleSearchUser(){
    if(username.trim().length===0){
      return;
    }
    router.push(`/${username.toLowerCase()}`);
    setUsername("");
  }
  function handleKeyDown(event){
    if(event.key === "Enter"){
      handleSearchUser();
    }
  }

  return (
    <>
      <div className={styles.accountDetailsContainer}>
        <div className={styles.accountProfile}>
          {session && (
            <Image
              src={postAuthorDp? postAuthorDp: session.user.image}
              height={50}
              width={50}
              alt="account_dp"
              className={styles.accountDp}
              onClick={()=>{goToProfileHandler(session.user.email.split("@")[0])}}
            />
          )}
          {session && (
            <div className={styles.accountData}>
              <h3 onClick={()=>{goToProfileHandler(session.user.email.split("@")[0])}}>{session.user.name}</h3>
              <h6>{session.user.email}</h6>
            </div>
          )}
          {!session && 
                <Link href="/auth/signIn">
                <div className={styles.signInButton}>Sign In</div>
              </Link>
          }
        </div>
      </div>

      <div className={styles.searchBarContainer}>
          <input type="text" placeholder="Search Memogram Users" value={username} onChange={(e)=>{setUsername(e.target.value)}} onKeyDown={handleKeyDown}/>
          <GoSearch className={styles.searchIcon} onClick={handleSearchUser}/>
      </div>
    </>
  );
}
