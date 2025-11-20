import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios.js'

const Project = () => {


    const location = useLocation();
    // console.log(location.state);
    
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState([]);

    const [users, setUsers] = useState([])

    const handelUserClick = (id)=>{
      setSelectedUserId(prevSelectedUserId=>{
        const newSelectedUserId = new Set(prevSelectedUserId);
        if(newSelectedUserId.has(id)){
          newSelectedUserId.delete(id);
        }else{
          newSelectedUserId.add(id);
        }
        return newSelectedUserId;
      })
    }

    useEffect(()=>{
      axios.get('/user/all').then(res=>{
        setUsers(res.data.users)
      }).catch(err=>{
        console.log(err);
      })

    },[])





  return (
    <main className='h-screen w-screen flex'>
      <section className='left h-full min-w-96 flex flex-col bg-slate-300 relative'>

        <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100'>

          <button className='flex gap-2' onClick=  {()=>setIsModelOpen(true)}> 
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

      {isModelOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
            <header className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Select User</h2>
              <button onClick={() => setIsModelOpen(false)} className='p-2'>
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map(user => (
                <div key={user._id} className={`user cursor-pointer hover:bg-slate-200 ${Array.from(selectedUserId).indexOf(user._id) != -1 ? 'bg-slate-200' : ""} p-2 flex gap-2 items-center`} onClick={() => handelUserClick(user._id)}>
                  <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className='font-semibold text-lg'>{user.email}</h1>
                </div>
              ))}
            </div>

            <button
            // onClick={addCollaborators}
            className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md'>
              Add Collaborators
            </button>

            
                        
          </div>
        </div>
      )}



      

    </main>
  )
}

export default Project;