import  { useState } from 'react'
import Roomsidebar from './Roomsidebar'
import RoomNavbar from './roomNavbar'
import CodeEditor from './codeEditor'
import { CODE_SNIPPETS } from '@/constant';

function Room() {
  const [language, setLanguage] = useState<keyof typeof CODE_SNIPPETS>("javascript");

  return (
    <div className='flex flex-col'>
      <RoomNavbar  language={language} setLanguage={setLanguage} />
      <div className='flex'>
        <Roomsidebar />
        <CodeEditor language={language} />
      </div>
    </div>
  )
}

export default Room;