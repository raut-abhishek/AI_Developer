import { useState } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'

const Project = () => {


    const location = useLocation();
    // console.log(location.state);
    
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  return (
    <main className='h-screen w-screen flex'>
      <section className='left h-full min-w-96 flex flex-col bg-slate-300 relative'>

        <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100'>

          <button className='flex gap-2'> 
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborators</p>
          </button>


          <button className='p-2' onClick=  {()=>setIsSidePanelOpen(!isSidePanelOpen)}>
            <i className="ri-group-fill"></i>
            
          </button>
        </header>

        <div className="conversation-area grow flex flex-col">
          <div className="message-box grow flex flex-col gap-2 p-1">
            <div className="message max-w-60 flex flex-col p-2 bg-slate-50 wrap-break-word rounded-md">
              <small className='opacity-65 text-xs'>example@gmail.com</small>
              <p className='text-sm'>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</p>
            </div>
            <div className="message max-w-60 ml-auto flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className='opacity-65 text-xs'>example@gmail.com</small>
              <p className='text-sm'>Lorem ipsum dolor sit amet.aaaaaaaaaaaaaaaaa</p>
            </div>
          </div>

          <div className="inputField flex items-center justify-between">
            <input className='p-2 px-4 border-none outline-no grow ' type="text" placeholder='Type message' />
            <button className='px-5 text-white bg-black h-full flex items-center justify-center rounded-full'>
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute top-0 left-0 transition-all ${ isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <header className='flex justify-end p-2 px-4 bg-slate-200'>
            <button className='p-2' onClick=  {()=>setIsSidePanelOpen(!isSidePanelOpen)}>
              <i className="ri-close-fill"></i>
            </button>

          </header>


          <div className="users flex flex-col gap-2">
            <div className="user cursor-pointer flex gap-2 items-center hover:bg-slate-200 rounded-full p-2">
              <div className='aspect-square w-fit h-fit flex items-center justify-center rounded-full p-5 text-white bg-slate-600'>
                <i className="ri-account-circle-fill absolute"></i>
              </div>
              <h1 className='font-semibold text-lg '>username</h1>
            </div>

          </div>

        </div>


      </section>

      

    </main>
  )
}

export default Project;