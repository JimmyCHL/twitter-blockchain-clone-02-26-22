import React, { useState, useContext } from 'react'
import { GiRocketThruster } from 'react-icons/gi'
import InitialState from './InitialState'
import LoadingState from './LoadingState'
import FinishedState from './FinishedState'
import { TwitterContext } from '../../context/TwitterContext'
import { useRouter } from 'next/router'
import { pinJSONToIPFS, pinFileToIPFS } from '../../lib/pinata'
import { client } from '../../lib/client'
import { ethers } from 'ethers'
import { contractAddress, contractABI } from '../../lib/constants'

let metamask

if (typeof window !== 'undefined') {
  metamask = window.ethereum
}

const ProfileImageMinter = () => {
  const router = useRouter()
  const { currentAccount, setAppState } = useContext(TwitterContext)
  const [status, setStatus] = useState('initial')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [profileImage, setProfileImage] = useState('')

  //get Contract
  const getEthereumContract = async () => {
    if (!metamask) return
    const provider = new ethers.providers.Web3Provider(metamask)
    const signer = provider.getSigner()
    const transactionContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    )
    return transactionContract
  }

  //mint function
  const mint = async () => {
    if (!name || !description || !profileImage) return

    setStatus('loading')

    const pinataMetadata = {
      name: `${name} - ${description}`,
    }

    const ipfsImageHash = await pinFileToIPFS(profileImage, pinataMetadata)

    await client
      .patch(currentAccount)
      .set({ profileImage: ipfsImageHash })
      .set({ isProfileImageNft: true })
      .commit()

    const imageMetadata = {
      name: name,
      description: description,
      image: `ipfs://${ipfsImageHash}`,
    }

    const ipfsJsonHash = await pinJSONToIPFS(imageMetadata)

    const contract = await getEthereumContract()

    const tokenId = await contract.mint(
      currentAccount,
      `ipfs://${ipfsJsonHash}`
    )

    await tokenId.wait()

    console.log(
      `Congratulation, you mint your NFT profileImage successfully -> ${tokenId.hash}`
    )

    setStatus('finished')

    //(probably no need the code below, we can mint NFT on our contract from all code above. It is just my personal guess.)

    // const transactionParameters = {
    //   to: contractAddress,
    //   from: currentAccount,
    //   gas: '0x5208', //gas 2100 wei
    //   data: tokenId.hash,
    //   value: ethers.utils.parseEther('0.1')._hex,
    // }

    //Creates new message call transaction or a contract creation, if the data field contains code.
    // try {
    //   await metamask.request({
    //     method: 'eth_sendTransaction',
    //     params: [transactionParameters],
    //   })

    //   setStatus('finished')
    // } catch (error) {
    //   console.log(error)
    //   setStatus('finished')
    // }
  }

  const modalChildren = (modalStatus = status) => {
    switch (modalStatus) {
      case 'initial':
        return (
          <InitialState
            profileImage={profileImage}
            setProfileImage={setProfileImage}
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            mint={mint}
          />
        )

      case 'loading':
        return <LoadingState />

      case 'finished':
        return <FinishedState />

      default:
        router.push('/').then(() => {
          setAppState('error')
        })
        break
    }
  }

  return <>{modalChildren(status)}</>
}

export default ProfileImageMinter
