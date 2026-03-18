import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from '/src/components/Header'
import './App.css'

function App() {
  return (
      <>
      <Header logo={reactLogo} title='Header Component'/> {/* Header with logo */}
      <div className='spacing'/>
      <Header  title='Header Component'/> {/* Header without logo */}
      </>
    )
}

export default App
