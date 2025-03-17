import React, { useState } from 'react'
import Roomsidebar from './Roomsidebar'
import RoomNavbar from './RoomNavbar'
import CodeEditor from './codeEditor'
import { CODE_SNIPPETS } from '@/constant';

function room() {
  const [language, setLanguage] = useState<keyof typeof CODE_SNIPPETS>("javascript");
  return (
    <div className='flex flex-col h-screen bg-gray-800'>
      <RoomNavbar language={language} setLanguage={setLanguage} />
      <div className='flex'>
        <Roomsidebar/>
      <CodeEditor language={language} /></div>

    </div>
  )
}

export default room