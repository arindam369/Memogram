import React from "react";
import { getProviders, signIn } from "next-auth/react";
import styles from "../../styles/Home.module.css";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function signInPage({ providers }) {
  return (
    <>
      <div className={styles.loginContainer}>

        <h3>Welcome to <b> Ariogram </b></h3>

        {Object.values(providers).map((provider) => {
          return (
            <div key={provider.name}>
              <button
                onClick={() => {
                  signIn(provider.id, { callbackUrl: "/" });
                }}
                className={styles.loginBtn}
              >
                <FcGoogle className={styles.icon} /> Sign in with{" "}
                {provider.name}
              </button>
            </div>
          );
        })}

        <h5><Link href="/">Return to Home </Link></h5>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
