import React from "react";
import { ImHome } from "react-icons/im";
import { IoIosAddCircleOutline } from "react-icons/io";
import Link from "next/link";
import styles from "../../styles/Home.module.css";
import Image from "next/image";
import {useSession, signOut} from "next-auth/react";

export default function Navbar(props) {
  const {data: session} = useSession();

  return (
    <>
      <div className={styles.navbarContainer}>
        <div className={styles.leftPart}>
          <Link href="/"> Memogram </Link>
        </div>
        <div className={styles.rightPart}>
            {props.disableCreatePost==="true"?"": 
            <IoIosAddCircleOutline className={styles.addPost} onClick={()=>{props.onCreate();}} />}
          <Link href="/">
            <ImHome className={styles.homeIcon} />
          </Link>
          <Link href="/auth/signIn">
            {!session &&
              <div className={styles.signinBtn}>Sign In</div>
            }
            {session && 
            <div className="userDp"> <Image src={session.user.image} width={48} height={48} alt="user_dp" className={styles.dp} onClick={()=>{signOut({callbackUrl: "/auth/signIn"})}}/> </div>}
          </Link>
        </div>
      </div>
    </>
  );
}
