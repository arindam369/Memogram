import React from 'react'
import {useSession} from "next-auth/react";
import styles from "../styles/Home.module.css";
import Post from '../components/Post/Post';
import Account from '../components/Account/Account';
import Navbar from "../components/Navbar/Navbar";

export default function HomePage() {
  const {data: session} = useSession();
  console.log(session);
  return (
    <>
      <Navbar/>
      {/* <h2>HomePage</h2>

      {session && 
        <h3>Hi {session.user.name}</h3>
      } */}
      <div className={styles.homeContainer}>
        <div className={styles.feeds}>
          <Post/>
          <Post/>
          <Post/>
        </div>
        <div className={styles.account}>
          <Account/>
        </div>

      </div>
    </>
  )
}
