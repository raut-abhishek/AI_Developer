import {useRef, useState, useEffect, useContext } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios.js'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket.js';
import {UserContext} from '../context/user.context.jsx';
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer.js';



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
    const [fileTree, setFileTree] = useState({})
    const [currentFile, setCurrentFile] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    const [webContainer, setWebContainer] = useState(null);
    const [ iframeUrl, setIframeUrl ] = useState(null)
    const [ runProcess, setRunProcess ] = useState(null)






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

    function WriteAiMessage(message){
      let text = message;

      try {
        const messageObject = JSON.parse(message);
        text = messageObject.text || message;
      } catch (err) {
        text = message;
      }
      return (
        <div className='overflow-auto bg-slate-950 text-white p-2 rounded-sm'>
          <Markdown>{text}</Markdown> 
        </div>
      )

    }

    // function saveFileTree(ft) {
    //   sendMessage('project-message', { fileTree: ft });
    // }

function flattenTree(tree, prefix = "") {
  let result = {};

  for (let key in tree) {
    const node = tree[key];

    // ▣ Handle file
    if (node.file) {
      const path = prefix ? `${prefix}/${key}` : key;
      result[path] = node.file; // { contents }
    }
  
    // ▣ Handle folder (AI uses children)
    if (node.children) {
      const newPrefix = prefix ? `${prefix}/${key}` : key;
      Object.assign(result, flattenTree(node.children, newPrefix));
    }
  }

  return result;
}


const wcRef = useRef(null);

    useEffect(()=>{

      const socket = initializeSocket(project._id);

      if (!wcRef.current) {
        getWebContainer().then(container => {
          wcRef.current = container;
          setWebContainer(container);
          console.log("WebContainer initialized");
        });
      }

      
      // old handleIncomming function
      // const handleIncomming = (data)=>{
      //   if (data.sender._id === user._id) return;


      //   console.log(data);
        


      //   setMessages(prevMessages=>[...prevMessages, data])
      // }


      const handleIncomming = (data) => {
        if (data.sender._id === user._id) return;

        let parsedMessage = data.message;

        if (data.sender._id === 'ai') {
          try {
            // If message is a string, try to parse it
            if (typeof data.message === 'string') {
              parsedMessage = JSON.parse(data.message);
            } else {
              parsedMessage = data.message;
            }
          } catch (err) {
            console.error("Failed to parse AI message:", err);
            console.error("Message was:", data.message);
            // Fallback: if it's already an object, use it; otherwise wrap in text
            parsedMessage = typeof data.message === 'string' 
              ? { text: data.message } 
              : data.message;
          }
        }
        
        // console.log("Parsed message:", parsedMessage);

        if(parsedMessage.fileTree){
          setFileTree(parsedMessage.fileTree);
          // console.log("PACKAGE_JSON_CONTENT:", parsedMessage.fileTree["package.json"]?.file?.contents);
        }
        webContainer?.mount(parsedMessage.fileTree)
        // if (parsedMessage.fileTree) {
        //   const flat = flattenTree(parsedMessage.fileTree);
        //   setFileTree(flat);
        // }


        const messageData = { ...data, parsedMessage };

        setMessages((prevMessages) => [...prevMessages, messageData]);
      };




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
      <section className='left relative flex flex-col h-screen min-w-96 bg-slate-300 border-r border-black'>

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
                <div key={msg._id || index} className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-54'} ${msg.sender._id == user._id.toString() && 'ml-auto'} maz-w-54 message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}>
                  <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                  <div className='text-sm'>
                    {msg.sender._id === 'ai' ?
                    WriteAiMessage(msg.message)
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


      <section className='right bg-red-50 grow h-full flex'> 
        <div className="explorer h-full max-w-64 min-w-80 bg-slate-200">
          <header className="flex bg-slate-100 top-0 rounded-b-md mb-2 h-14 items-center justify-center">
            <h1 className="text-lg">Files</h1>
          </header>
          <div className="file-tree w-full">
            {
              Object.keys(fileTree).map((file, index) => (
                <button
                key={index}
                onClick={() => {
                setCurrentFile(file)
                setOpenFiles([ ...new Set([ ...openFiles, file ]) ])
                }}
                className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full rounded-md mb-1 ">
                  <p
                  className='font-semibold text-lg'
                  >{file}</p>
                </button>
              ))

            }
          </div>

        </div>

        {/* {currentFile && ( */}
          <div className="code-editor flex flex-col grow h-full shrink">

            <div className="top flex justify-between w-full">

              <div className="files flex">
                {
                  openFiles.map((file, index) => (
                    <button
                    key={file}
                    onClick={() => setCurrentFile(file)}
                    className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2  bg-slate-300 ${currentFile === file ? 'bg-slate-400' : ''}`}
                    >
                      <p
                          className='font-semibold text-lg'
                      >{file}</p>
                    </button>
                  ))
                }
              </div>

              <div className="action flex gap-2">
                <button
                // onClick={async () => {
                //   await webContainer.mount(fileTree)

                //   const installProcess = await webContainer.spawn("npm", [ "install" ])
                //   installProcess.output.pipeTo(new WritableStream({
                //     write(chunk) {
                //       console.log(chunk)
                //     }
                //   }))

                //   if (runProcess) {
                //     runProcess.kill()
                //   }

                //   let tempRunProcess = await webContainer.spawn("npm", [ "start" ]);

                //   tempRunProcess.output.pipeTo(new WritableStream({
                //     write(chunk) {
                //       console.log(chunk)
                //     }
                //   }))

                //   setRunProcess(tempRunProcess)

                //   webContainer.on('server-ready', (port, url) => {
                //       console.log(port, url)
                //       setIframeUrl(url)
                //   })

                // }}
                onClick={async () => {
                  if (!webContainer) return;

                  // 1. Mount files
                  await webContainer.mount(fileTree);

                  // 2. Run npm install
                  const installProcess = await webContainer.spawn("npm", ["install"]);

                  // Log output
                  installProcess.output.pipeTo(new WritableStream({
                    write(chunk) {
                      console.log(chunk);
                    }
                  }));

                  // 3. WAIT for install to finish
                  await installProcess.exit;

                  // 4. Start app AFTER install is done
                  const runProcess = await webContainer.spawn("npm", ["start"]);

                  runProcess.output.pipeTo(new WritableStream({
                    write(chunk) {
                      console.log(chunk);
                    }
                  }));

                  setRunProcess(runProcess);
                }}

                className='p-2 px-4 bg-slate-300 text-white'
                >
                  run
                </button>


              </div>
              
            </div>

            <div className="bottom flex grow ">
              {
                fileTree[currentFile] && (
                  <textarea 
                  value={fileTree[currentFile]?.file.contents || ""}
                  onChange={(e)=>{
                    setFileTree({
                      ...fileTree,
                      [currentFile]: {
                        ...fileTree[currentFile],
                        file: {
                          ...fileTree[currentFile].file,
                          contents: e.target.value
                        }
                      }
                    });
                  }}
                  className='w-full h-full p-4 bg-slate-50 outline-none border font-mono whitespace-pre-wrap'
                  >

                  </textarea>
                )
              }
            </div>
            
          </div>
        {/* )} */}

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



// {
//             currentFile && (
//               <div className="code-editor-header flex justify-between items-center p-2 bg-slate-200">
//                 <h1 className='font-semibold text-lg'>{currentFile}</h1>
//                 <button className='p-2' onClick={()=>setCurrentFile(null)}>
//                   <i className='ri-close-fill'></i>
//                 </button>
//               </div>
//             )
//           }