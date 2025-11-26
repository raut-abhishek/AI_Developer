import { useState, useEffect, useContext } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios.js'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket.js';
import {UserContext} from '../context/user.context.jsx';
import Markdown from 'markdown-to-jsx';



const Project = () => {


    const location = useLocation();
    // console.log(location.state);
    
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState([]);
    const [project, setProject] = useState(location.state.project);
    const [message, setMessage] = useState('');
    const {user} = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const messageBox = React.createRef();
    const [ messages, setMessages ] = useState([])

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


    function addCollaborators(){

      axios.put('/projects/add-user',{
        projectId: location.state.project._id,
        users: Array.from(selectedUserId)
      }).then(res=>{
        setIsModelOpen(false)
      }).catch(err=>{
        console.log(err);
      })

    }


    function send() {
      const msgObj = {
        message,
        sender: user
      }

      sendMessage('project-message', msgObj);
      setMessages(prevMessages => [ ...prevMessages, { sender: user, message } ])
      setMessage("");
    }



    useEffect(()=>{

      const socket = initializeSocket(project._id);

      

      const handleIncomming = (data)=>{
        if (data.sender._id === user._id) return;
        setMessages(prevMessages=>[...prevMessages, data])
      }

      receiveMessage('project-message',handleIncomming)


      axios.get(`/projects/get-project/${location.state.project._id}`).then(res=>{
        setProject(res.data.project)
      })


      axios.get('/user/all').then(res=>{
        setUsers(res.data.users)
      }).catch(err=>{
        console.log(err);
      })

      return()=>{
        socket.off("project-message", handleIncomming);
      }


    },[]);







  return (
    <main className='h-screen w-screen flex'>
      <section className='left relative flex flex-col h-screen min-w-96 bg-slate-300 border-r border-gray-400'>

        <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0 rounded-b-md'>

          <button className='flex gap-2' onClick=  {()=>setIsModelOpen(true)}> 
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborators</p>
          </button>


          <button className='p-2' onClick=  {()=>setIsSidePanelOpen(!isSidePanelOpen)}>
            <i className="ri-group-fill"></i>
            
          </button>
        </header>

        <div className="conversation-area pt-14 grow flex flex-col h-full relative " >
          
            <div 
            ref={messageBox} 
            className="message-box grow p-1 flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide">
              {messages.map((msg, index) => (
                <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-54'} ${msg.sender._id == user._id.toString() && 'ml-auto'} maz-w-54 message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}>
                  <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                  <div className='text-sm'>
                    {msg.sender._id === 'ai' ?
                    <div className='overflow-auto bg-slate-950 text-white p-2 rounded-sm'>

                      <Markdown>{msg.message}</Markdown> 
                    </div>
                    :
                    msg.message}
                  </div>
                </div>
              ))}
            </div>
            
          
          

          <div className="inputField w-full px-3 py-3 bg-white rounded-t-md flex items-center gap-2">
            <input 
            value={message}
            onChange={(e)=> setMessage(e.target.value)}
            className='grow rounded-full bg-gray-100 px-4 py-2 text-sm outline-none border border-transparent focus:border-gray-300 transition' 
            type="text" 
            placeholder='Type message...' 
            />

            <button onClick={send} className='w-10 h-10 bg-black text-white rounded-full flex items-center justify-center active:scale-95 transition'>
              <i className="ri-send-plane-fill text-lg"></i>
            </button>
          </div>
        </div>

        <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute top-0 left-0 transition-all ${ isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <header className='flex justify-between items-center p-2 px-4 bg-slate-200'>
            <h1 className='font-semibold text-lg'>Collaborators</h1>
            <button className='p-2' onClick=  {()=>setIsSidePanelOpen(!isSidePanelOpen)}>
              <i className="ri-close-fill"></i>
            </button>

          </header>


          <div className="users flex flex-col gap-2">
            {project.users && project.users.map(user=>{
              return (
                <div className="user cursor-pointer flex gap-2 items-center hover:bg-slate-200 rounded-full p-2">
                  <div className='aspect-square w-fit h-fit flex items-center justify-center rounded-full p-5 text-white bg-slate-600'>
                    <i className="ri-account-circle-fill absolute"></i>
                  </div>
                  <h1 className='font-semibold text-lg '>{user.email}</h1>
                </div>
              )
            })}

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
            onClick={addCollaborators}
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