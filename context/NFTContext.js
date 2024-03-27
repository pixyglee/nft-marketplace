import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers, JsonRpcProvider } from 'ethers';
import axios from 'axios';
import { MarketAddress, MarketAddressABI } from './constants';
//import { create as ipfsHttpClient } from 'ipfs-http-client';
// import { create } from 'ipfs-core'

const { create } = require("ipfs-http-client")

const projectId = "2KuvBLqCRXLeGMIj0Mq37NE3PIb"
const projectSecretKey = "bd46e214057b7cfee8ffaff4a28c4308"
//const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecretKey).toString('base64');

export const NFTContext = React.createContext();
const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
})
//const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

const fetchContract = (signerOrProvider) => new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);
//const contract = new ethers.Contract(contractAddress, ABI, signer);



export const NFTProvider = ({ children }) => {

  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  const nftCurrency = 'MATIC';

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) {
      return alert('Please install MetaMask');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log('No accounts found.');
      }

      console.log({ accounts });
    } catch (error) {
      console.error('Error connecting wallet:', error.message);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    //  createSale('test', '0.025');
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      return alert('Please install MetaMask');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.error('Error connecting wallet:', error.message);
    }
  };
  const uploadToIPFS = async (file) => {
    try {
      // console.log(file)
      const added = await client.add({ content: file });
      console.log(added)
      const url = `https://new-nft.infura-ipfs.io/ipfs/${added.path}`;
      return url;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error.message);
    }
  };

  const createNFT = async (formInput, fileUrl, router) => {

    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image: fileUrl })

    try {

      const added = await client.add(data);
      const url = `https://new-nft.infura-ipfs.io/ipfs/${added.path}`;

      await createSale(url, price);

      router.push('/')

    } catch (error) {
      console.log('Error uploading file to IPFS')
    }

  }

  const createSale = async (url, formInputPrice, isReselling, id) => {

    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    //const provider = new ethers.providers.Web3Provider(connection);
    const provider = new ethers.BrowserProvider(connection)

    const signer = await provider.getSigner();

    const price = ethers.parseUnits(formInputPrice, 'ether');
    const contract = fetchContract(signer);

    const listingPrice = await contract.getListingPrice();

    const transaction = !isReselling
    ? await contract.createToken(url, price, { value: listingPrice.toString() })
    : await contract.resellToken(id, price, { value: listingPrice.toString() });

    setIsLoadingNFT(true)
    await transaction.wait();


    console.log(contract);

  }

  const fetchNFTs = async () => {

    setIsLoadingNFT(false);
    const provider = new JsonRpcProvider();

    const contract = fetchContract(provider);

    const data = await contract.fetchMarketItems();

    console.log(data);

    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { image, name, description } } = await axios.get(tokenURI);
      const price = ethers.formatUnits(unformattedPrice.toString(), 'ether');
      return {
        price,
        tokenId: Number(tokenId),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI
      }

    }));

    return items;

    console.log(data);

  }

  const fetchMyNftsOrListedNfts = async (type) => {
    setIsLoadingNFT(false);
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    //const provider = new ethers.providers.Web3Provider(connection);
    const provider = new ethers.BrowserProvider(connection)

    const signer = await provider.getSigner();
    const contract = fetchContract(signer);

    const data = type === 'fetchItemsListed' ? await contract.fetchItemsListed() : await contract.fetchMyNFTs()

    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { image, name, description } } = await axios.get(tokenURI);
      const price = ethers.formatUnits(unformattedPrice.toString(), 'ether');
      return {
        price,
        tokenId: Number(tokenId),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI
      }

    }));

    return items;

  }

  const buyNFT = async(nft) =>{

    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    //const provider = new ethers.providers.Web3Provider(connection);
    const provider = new ethers.BrowserProvider(connection)

    const signer = await provider.getSigner();
    const contract = fetchContract(signer);
    const price = ethers.parseUnits(nft.price.toString(), 'ether');

    const transaction = await contract.createMarketSale(nft.tokenId, {value: price});

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);

  }
  return (
    <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount, uploadToIPFS, createNFT, fetchNFTs, fetchMyNftsOrListedNfts, buyNFT, createSale, isLoadingNFT }}>
      {children}
    </NFTContext.Provider>
  );
};
