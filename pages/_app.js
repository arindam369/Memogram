import '../styles/globals.css';
import "./../skeletons/SkeletonElement.css";
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import {ThemeContextProvider} from "./../store/ThemeContext";

function MyApp({ Component, pageProps:{session, ...pageProps} }) {

  return (
    <ThemeContextProvider>
      <SessionProvider session={session}>
        <Head>
            <meta
              name="description"
              content="Share your memories with others"
            />
            <meta
              name="keywords"
              content="Memogram, cultural, memories, feeds, stories, memory, like, comment, share"
            />
            <meta name="author" content="Arindam Halder" />
            <title>Memogram</title>

            <meta property="og:locale" content="en_US" />
            <meta property="og:type" content="article" />
            <meta property="og:title" content="Memogram" />
            <meta
              property="og:description"
              content="Share your memories with others"
            />
            <meta property="og:url" content="https://memogram.vercel.app" />
            <meta property="og:site_name" content="Memogram" />
            <meta property="og:image" itemProp="image" content="https://memogram-nine.vercel.app/favicon.ico"/>
            <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
            <link rel="icon" type="image/x-icon" href="favicon.ico" />
          </Head>
        <div className="components">
          <Component {...pageProps}/>
        </div>
      </SessionProvider>
    </ThemeContextProvider>)
}

export default MyApp
