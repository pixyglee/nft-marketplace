import React from 'react'
import { useState, useEffect, useContext } from 'react'
import { NFTContext } from '@/context/NFTContext'
import { NFTCard, Loader, Banner, Searchbar } from '@/components'
import Image from "next/image"
import images from "../assets"
import { shortenAddress } from '@/utils/shortenAddress'
//import { Searchbar } from '@/components'


const MyNFTs = () => {

  const { fetchMyNftsOrListedNfts, currentAccount } = useContext(NFTContext);
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSelect, setActiveSelect] = useState('Recently Added');
  const [nftsCopy, setNftsCopy] = useState([]);

  useEffect(() => {
    fetchMyNftsOrListedNfts()
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
  if (isLoading) {
    return (
      <div className='flexStart min-h-screen'>
        <Loader />
      </div>
    )
  }
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
  return (
    <div className='w-full flex justify-start items-start flex-col min-h-screen'>
      <div className='w-full flexCenter flex-col'>
        <Banner
          banner="Ether To Earth"
          childStyles="text-center mb-4"
          parentStyles="justify-center h-80"
        />
        <div className='flexCenter flex-col -mt-20 z-0'>
          <div className='flexCenter w-40 h-40 sm:w-36 sm:h-36 p-1 bg-nft-black-2 rounded-full'>
            <Image src={images.creator1} className='rounded-full object-cover' objectFit='cover' />
          </div>
          <p className='font-poopins dark:text-white text-nft-black-1 font-semibold text-2xl mt-6'>{shortenAddress(currentAccount)}</p>
        </div>
      </div>
      {!isLoading && !nfts.length && !nftsCopy.length ?(
        <div className='w-full flexCenter sm:p-4 p-16'>
          <h1 className='font-poppins dark:text-white text-nft-black-1 font-extrabold text-2xl'>
            No NFTs Owned
          </h1>
        </div>
      ) : (
        <div className='sm:px-4 p-12 w-full minmd:w-4/5 flexCenter flex-col'>
          {/* Content for when there are NFTs */}
          <div className='flex-1 w-full flex flex-row sm:flex-col px-4 xs:px-0 minlg:px-8'>
            <Searchbar 
              activeSelect={activeSelect} 
              setActiveSelect={setActiveSelect}
              handleSearch={onHandleSearch}
              clearSearch={onClearSearch}
            />
          </div>
          <div className='mt-3 w-full flex'>
          {nfts.map((nft)=><NFTCard key={nft.tokenId} nft={nft} onProfilePage/>)}
          </div>
        </div>
      )}

    </div>
  )
}

export default MyNFTs