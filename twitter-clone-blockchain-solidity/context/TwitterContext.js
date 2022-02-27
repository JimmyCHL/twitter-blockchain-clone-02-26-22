import { createContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { client } from '../lib/client'

export const TwitterContext = createContext()

export const TwitterProvider = ({ children }) => {
  const [appState, setAppState] = useState('notConnected')
  const [currentAccount, setCurrentAccount] = useState('')
  const [tweets, setTweets] = useState([])
  const [currentUser, setCurrentUser] = useState({})
  const router = useRouter()

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [currentAccount, router.query.mint])

  useEffect(() => {
    if (!currentAccount || appState !== 'connected') return
    getCurrentUserDetails()
    fetchTweets()
  }, [currentAccount, appState, router.query.mint])

  //check if connected
  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return setAppState('noMetaMask')
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_accounts',
      })
      if (addressArray.length > 0) {
        //connected
        setAppState('connected')
        setCurrentAccount(addressArray[0])
        createUserAccount(addressArray[0])
      } else {
        //unconnected
        router.push('/')
        setAppState('notConnected')
        setCurrentAccount('')
      }
    } catch (error) {
      setAppState('error')
      router.push('/')
    }
  }

  //initiates MetaMask wallet connection
  const connectToWallet = async () => {
    if (!window.ethereum) return setAppState('noMetaMask')
    try {
      setAppState('loading')
      const addressArray = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (addressArray.length > 0) {
        setCurrentAccount(addressArray[0])
        createUserAccount(addressArray[0])
        setAppState('connected')
      } else {
        router.push('/')
        setAppState('notConnected')
      }
    } catch (error) {
      setAppState('error')
      router.push('/')
    }
  }

  //Creates an account in Sanity DB if the user does not already have one
  const createUserAccount = async (userWalletAddress = currentAccount) => {
    if (!window.ethereum) return setAppState('noMetaMask')
    try {
      const userDoc = {
        _type: 'users',
        _id: userWalletAddress,
        name: 'Unnamed',
        isProfileImageNft: false,
        profileImage:
          'https://bestprofilepictures.com/wp-content/uploads/2021/04/Cool-Profile-Picture.jpg',
        walletAddress: userWalletAddress,
      }

      await client.createIfNotExists(userDoc)
    } catch (error) {
      setAppState('error')
      router.push('/')
    }
  }

  const getProfileImageUrl = async (imageUri, isNft) => {
    if (isNft) {
      return `https://gateway.pinata.cloud/ipfs/${imageUri}`
    } else {
      return imageUri
    }
  }

  // fetchTweets
  const fetchTweets = async () => {
    const query = `
        *[_type == "tweets"]{
            "author": author->{name, walletAddress, profileImage, isProfileImageNft},
            tweet,
            timestamp,
        }|order(timestamp desc)
      `
    const sanityResponse = await client.fetch(query)

    const tweetsArray = []

    await sanityResponse.forEach(async (item) => {
      const profileImageUrl = await getProfileImageUrl(
        item.author.profileImage,
        item.author.isProfileImageNft
      )

      const newItem = {
        tweet: item.tweet,
        timestamp: item.timestamp,
        author: {
          name: item.author.name,
          walletAddress: item.author.walletAddress,
          isProfileImageNft: item.author.isProfileImageNft,
          profileImage: profileImageUrl,
        },
      }

      tweetsArray.push(newItem)
    })

    setTweets(tweetsArray)
  }

  //get user details
  const getCurrentUserDetails = async (userAccount = currentAccount) => {
    if (appState !== 'connected') return

    const query = `
        *[_type == "users" && _id == "${userAccount}"]{
            "tweets": tweets[]->{timestamp, tweet}|order(timestamp desc),
            name,
            profileImage,
            isProfileImageNft,
            coverImage,
            walletAddress
        }
    `
    const response = await client.fetch(query)

    const profileImageUrl = await getProfileImageUrl(
      response[0].profileImage,
      response[0].isProfileImageNft
    )

    setCurrentUser({
      tweets: response[0].tweets,
      name: response[0].name,
      profileImage: profileImageUrl,
      walletAddress: response[0].walletAddress,
      coverImage: response[0].coverImage,
      isProfileImageNft: response[0].isProfileImageNft,
    })
  }

  return (
    <TwitterContext.Provider
      value={{
        appState,
        setAppState,
        currentAccount,
        connectToWallet,
        fetchTweets,
        tweets,
        currentUser,
      }}
    >
      {children}
    </TwitterContext.Provider>
  )
}
