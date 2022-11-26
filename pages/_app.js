import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'

function MyApp({ Component, pageProps:{session, ...pageProps} }) {
  return (
    <SessionProvider session={session}>
      <div className="components">
        <Component {...pageProps}/>
      </div>
    </SessionProvider>)
}

export default MyApp
