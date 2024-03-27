import { ThemeProvider } from 'next-themes'
import '@/styles/globals.css'
import Script from 'next/script'
import { Navbar, Footer } from '@/components'
import { NFTProvider } from '@/context/NFTContext'

export default function App({ Component, pageProps }) {
  return(
  <NFTProvider>
  <ThemeProvider attribute="class">
  <div className='dark:bg-nft-dark bg-white min-h-screen'>
    <Navbar/>
    <div className='pt-65'>
      <Component {...pageProps} />
    </div>
    <Footer/>
  </div>
  <Script src="https://kit.fontawesome.com/8a40a6fca5.js" crossOrigin="anonymous"/>
  </ThemeProvider>
  </NFTProvider>
  )
}
