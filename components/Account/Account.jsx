import React from "react";
import styles from "../../styles/Home.module.css";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Account() {
  const { data: session } = useSession();
  const router = useRouter();

  function goToProfileHandler(username){
    router.push(`/${username}`);
  }

  return (
    <>
      <div className={styles.accountDetailsContainer}>
        <div className={styles.accountProfile}>
          {session && (
            <Image
              src={session.user.image}
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
    </>
  );
}
