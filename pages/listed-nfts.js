import { useState, useEffect, useContext } from 'react'
import { NFTContext } from '@/context/NFTContext'
import { NFTCard } from '@/components'
import { Loader } from '@/components'

const ListedNFTs = () => {

    const { fetchMyNftsOrListedNfts } = useContext(NFTContext);

    const [nfts, setNfts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMyNftsOrListedNfts('fetchItemsListed')
        .then((items)=>{
          setNfts(items);
          setIsLoading(false);
          console.log(items);
        })
      },[])

    if (isLoading) {
        return (
            <div className='flexStart min-h-screen'>
                <Loader />
            </div>
        )
    }
    if (!isLoading && nfts.length === 0) {
        return (
            <div className='flexCenter min-h-screen sm:p-4 p-16'>
                <h1 className='font-poppins dark:text-white text-nft-black-1 text-3xl font-extrabold'>No Nfts Listed For Sale</h1>
            </div>
        )
    }
    return (
        <div className='flex justify-center sm:px-4 p-12 min-h-screen'>
            <div className='w-full minmd:w-4/5'>
                <div className='mt-4'>
                    <h1 className='font-poppins dark:text-white text-nft-black-1 text-2xl font-semibold mt-2 ml-4 sm:ml-2'>Nfts Listed For Sale</h1>
                    <div className='mt-3 w-full flex flex-wrap justify-start md:justify-center'>
                        {nfts.map((nft)=><NFTCard key={nft.tokenId} nft={nft}/>)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListedNFTs