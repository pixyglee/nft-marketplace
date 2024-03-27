import Image from 'next/image'
import {useState, useRef, useEffect, useContext} from 'react'
import CreatorCard from '@/components/CreatorCard'
import { useTheme } from 'next-themes'
import { Inter } from 'next/font/google'
import { Banner } from '@/components'
import images from '../assets'
import { makeId } from '@/utils/makeId'
import { NFTCard, Searchbar , Loader} from '@/components'
import { NFTContext } from '@/context/NFTContext'
import { getCreators } from '@/utils/getTopCreators'
import { shortenAddress } from '@/utils/shortenAddress'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [hideButtons, setHideButtons] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);
  const [activeSelect, setActiveSelect] = useState('Recently added');
  const [isLoading, setIsLoading] = useState(true);

  const {fetchNFTs} = useContext(NFTContext);

  const parentRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchNFTs()
    .then((items)=>{
      setNfts(items);
      setNftsCopy(items);
      setIsLoading(false);
      console.log(items);
    })
  },[])

  useEffect(() =>{
    const sortedNfts = [...nfts];
    switch (activeSelect) {
      case 'Price (low to high)':
        setNfts(sortedNfts.sort((a, b) => a.price - b.price));
        break;
      case 'Price (high to low)':
        setNfts(sortedNfts.sort((a, b) => b.price - a.price));
        break;
      case 'Recently added':
        setNfts(sortedNfts.sort((a, b) => b.tokenId - a.tokenId));
        break;
      default:
        setNfts(nfts);
        break;
    }
  },[activeSelect])

  const onHandleSearch = (value) =>{
    const filteredNFTs = nfts.filter(({name}) =>
      name.toLowerCase().includes(value.toLowerCase()));
    if(filteredNFTs.length)
    setNfts(filteredNFTs)
    else
    setNfts(nftsCopy)
  }
  const onClearSearch = () =>{
    if(nfts.length && nftsCopy.length){
      setNfts(nftsCopy);
    }
  }
  const theme = useTheme();

  const handleScroll = (direction) =>{
    const {current} = scrollRef;

    const scrollAmount = window.innerWidth > 1800 ? 270 : 210;

    if(direction === 'left')
      current.scrollLeft -= 100;
    else
    current.scrollLeft += 100;
  }
  
  const isScrollable = () => {
    const { current } = scrollRef;
    const { current: parent } = parentRef;
  
    if (current?.scrollWidth >= parent?.offsetWidth) {
      setHideButtons(false);
    } else {
      setHideButtons(true);
    }
  };
  
  useEffect(() => {
    // Call your function or add your logic here
    isScrollable();
    window.addEventListener('resize', isScrollable)

    return ()=>{

      window.removeEventListener('resize', isScrollable)

    }
  }); // Add dependencies if needed
  
  //console.log(makeId(3));

  const TopCreators = getCreators(nftsCopy);

  console.log(TopCreators);

  return (
   <div className="flex justify-center sm:px-4 p-12">
    <div className='w-full minmd:w-4/5'>
      <Banner
      banner={(<>Discover, collect, and sell <br/>extraordinary NFTs</>)}
      childStyles="md:text-4xl sm:text-2xl xs:text-xl text-left"
        parentStyles="justify-start mb-6 h-72 sm:h-60 p-12 xs:p-4 xs:h-44 rounded-3xl"
      />
      {!isLoading && !nfts.length ? (
        <h1 className='font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0'>That's weird... No Nfts for sale</h1>
      ): isLoading ? <Loader/> :(<>
      <div>
        <h1 className='font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0'>Top Sellers</h1>
        <div className='relative flex-1 max-w-full flex mt-3' ref={parentRef}>
          <div className='flex flex-row w-max overflow-x-scroll no-scrollbar select-none' ref={scrollRef}>
          {TopCreators.map((creator, i)=>(
              <CreatorCard
                key={creator.seller}
                rank={i + 1}
                creatorImage={images[`creator${i + 1}`]}
                creatorName={shortenAddress(creator.seller)}
                creatorEths={creator.sum}
              />
            ))}
            {/* {[6, 7, 8, 9, 10].map((i)=>(
              <CreatorCard
                key={`creator-${i}`}
                rank={i}
                creatorImage={images[`creator${i}`]}
                creatorName={`0x${makeId(3)}...${makeId(4)}`}
                creatorEths={10 - i * 0.5}
              />
            ))} */}
            
            {!hideButtons && (
              <>
            <div onClick={()=>handleScroll('left')} className='absolute w-8 h-8 minlg:w-12 minlg:h-12 top-45 cursor-pointer left-0'>
              <Image 
              src={images.left}
              fill
              style={{objectFit:"contain"}}
              alt="left_arrow"
              className={
                theme === 'light' &&
                "filter invert"
              }
              />
            </div>
            <div onClick={()=>handleScroll('right')} className='absolute w-8 h-8 minlg:w-12 minlg:h-12 top-45 cursor-pointer right-0'>
              <Image 
              src={images.right}
              fill
              style={{objectFit:"contain"}}
              alt="left_arrow"
              className={
                theme === 'light' &&
                "filter invert"
              }
              />
            </div>
            </>
            )}
            
          </div>
        </div>
      </div>
      <div>
        <div className='flexBetween mx-4 xs:mx-0 minlg:mx-8 sm:flex-col sm:items-start'>
          <h1 className='flex-1 before:first:font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold sm:mb-4'>Hot NFTs</h1>
           <div className='flex-2 sm:w-full flex flex-row sm:flex-col'>
            <Searchbar 
              activeSelect={activeSelect} 
              setActiveSelect={setActiveSelect}
              handleSearch={onHandleSearch}
              clearSearch={onClearSearch}
            />
            </div>
        </div>
        <div className='mt-3 w-full flex flex-wrap justify-start md:justify-center'>
        {nfts.map((nft)=><NFTCard key={nft.tokenId} nft={nft}/>)}
          {/* {Array.from({length: 10}).map((_,i)=>(
          <NFTCard
          key={`nft-card-${i}`}
          nft={{
            i,
            name:`Test NFT ${i+1}`,
            price:(10 - i * 0.534).toFixed(2),
            seller:`0x${makeId(3)}...${makeId(4)}`,
            owner: `0x${makeId(3)}...${makeId(4)}`,
            description: 'Cool NFT on Sale',
          }}
          />))} */}
        </div>
      </div>
      </>)}
    </div>
   </div>
  )
}
