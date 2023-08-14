'use client'

import { useContext, useEffect } from 'react'
import { Connected } from '../components/Connected'
import { connectSnap, getSnap } from '../utils'
import { MetaMaskContext } from '../hooks'
import { defaultSnapOrigin } from '../config'
import Header from '../components/Header'

const HomePage = () => {
  return (
    <Header />
  )
}

export default HomePage
