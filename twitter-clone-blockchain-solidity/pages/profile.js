import React, { useContext } from 'react'
import Sidebar from '../components/Sidebar'
import Widgets from '../components/Widgets'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileTweets from '../components/profile/ProfileTweets'
import { TwitterContext } from '../context/TwitterContext'

const style = {
  wrapper: `flex justify-center h-screen w-screen select-none bg-[#15202b] text-white  overflow-auto`,
  content: `max-w-[1600px] w-3/4 flex justify-between`,
  mainContent: `flex-[2] border-r border-l border-[#38444d] overflow-y-auto  min-w-[350px] scrollbar-hide`,
}

const Profile = () => {
  const { currentAccount } = useContext(TwitterContext)

  if (!currentAccount) {
    return <div className={`${style.wrapper} items-center`}>Wait...</div>
  }

  return (
    <div className={style.wrapper}>
      <div className={style.content}>
        <Sidebar />
        <div className={style.mainContent}>
          <ProfileHeader />
          <ProfileTweets />
        </div>
        <Widgets />
      </div>
    </div>
  )
}

export default Profile
