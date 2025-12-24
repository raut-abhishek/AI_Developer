import { useRef, useState, useEffect, useContext } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios.js';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket.js';
import { UserContext } from '../context/user.context.jsx';
import Markdown from 'markdown-to-jsx';
import { getWebContainer } from '../config/webContainer.js';

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState('');
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const messageBox = useRef(null);
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const wcRef = useRef(null);

  const handelUserClick = (id) => {
    setSelectedUserId(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const addCollaborators = () => {
    axios.put('/projects/add-user', {
      projectId: project._id,
      users: Array.from(selectedUserId)
    }).then(() => setIsModelOpen(false))
      .catch(console.log);
  };

  const send = () => {
    sendMessage('project-message', { message, sender: user });
    setMessages(prev => [...prev, { sender: user, message }]);
    setMessage('');
  };

  const WriteAiMessage = (message) => {
    let text = message;
    try { const obj = JSON.parse(message); text = obj.text || message; } 
    catch { text = message; }
    return <div className='overflow-auto bg-gray-900 text-white p-2 rounded-md'><Markdown>{text}</Markdown></div>;
  };

  useEffect(() => {
    const socket = initializeSocket(project._id);
    if (!wcRef.current) getWebContainer().then(container => { wcRef.current = container; setWebContainer(container); });

    const handleIncoming = (data) => {
      if (data.sender._id === user._id) return;
      let parsedMessage = data.sender._id === 'ai' ? (() => { try { return JSON.parse(data.message); } catch { return { text: data.message }; } })() : data.message;
      if (parsedMessage.fileTree) { setFileTree(parsedMessage.fileTree); webContainer?.mount(parsedMessage.fileTree); }
      setMessages(prev => [...prev, { ...data, parsedMessage }]);
    };

    receiveMessage('project-message', handleIncoming);

    axios.get(`/projects/get-project/${project._id}`).then(res => setProject(res.data.project));
    axios.get('/user/all').then(res => setUsers(res.data.users)).catch(console.log);

    return () => socket.off("project-message", handleIncoming);
  }, []);

  return (
    <main className='h-screen w-screen flex bg-gray-900 text-gray-100'>
      {/* Left Panel */}
      <section className='flex flex-col w-1/3 max-w-md border-r border-gray-700 relative'>
        {/* Header */}
        <header className='flex justify-between items-center p-4 bg-gray-800 sticky top-0 z-20 rounded-b-md'>
          <h1 className='text-xl font-bold'>{project.name}</h1>
          <div className='flex gap-2'>
            <button onClick={() => setIsModelOpen(true)} className='px-2 py-1 bg-indigo-600 rounded-md hover:bg-indigo-700'>Add Users</button>
            <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='px-2 py-1 bg-gray-700 rounded-md hover:bg-gray-600'>Collaborators</button>
          </div>
        </header>

        {/* Messages */}
        <div ref={messageBox} className='flex flex-col grow p-3 overflow-y-auto gap-2'>
          {messages.map((msg, i) => (
            <div key={i} className={`p-2 rounded-md max-w-[80%] ${msg.sender._id === user._id ? 'ml-auto bg-indigo-700 text-white' : 'bg-gray-700 text-gray-100'}`}>
              <small className='opacity-60 text-xs'>{msg.sender.email}</small>
              <div>{msg.sender._id === 'ai' ? WriteAiMessage(msg.message) : msg.message}</div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className='flex p-3 gap-2 bg-gray-800'>
          <input
            type='text'
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder='Type message...'
            className='grow px-3 py-2 rounded-full bg-gray-700 outline-none text-white'
          />
          <button onClick={send} className='px-3 py-2 bg-indigo-600 rounded-full hover:bg-indigo-700'>Send</button>
        </div>

        {/* Side Panel */}
        <div className={`absolute top-0 left-0 w-full h-full bg-gray-800 p-4 transform transition-transform ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <header className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-bold'>Collaborators</h2>
            <button onClick={() => setIsSidePanelOpen(false)}>Close</button>
          </header>
          <div className='flex flex-col gap-2 overflow-y-auto max-h-[80%]'>
            {project.users?.map(u => (
              <div key={u._id} className='p-2 bg-gray-700 rounded-md flex items-center gap-2 hover:bg-gray-600'>
                <i className="ri-user-fill"></i>
                <span>{u.email}</span>
              </div>
            ))}
          </div>
        </div>
      </section>  

      {/* Right Panel */}
      <section className='flex flex-col grow'>
        <div className='flex gap-2 p-2 bg-gray-800 '>
          <div className='w-1/4 bg-gray-700 p-2 rounded-md overflow-auto h-178'>
            <h3 className='font-semibold mb-2 '>Files</h3>
            {Object.keys(fileTree).map((file, i) => (
              <button
                key={i}
                onClick={() => { setCurrentFile(file); setOpenFiles([...new Set([...openFiles, file])]); }}
                className='w-full text-left p-1 mb-1 bg-gray-600 rounded-md hover:bg-gray-500'
              >
                {file}
              </button>
            ))}
          </div>

          {/* Code Editor */}
          <div className='flex flex-col grow overflow-hidden'>
            {/* Tabs */}
            <div className='flex gap-2 mb-2 '>
              {openFiles.map(file => (
                <button
                  key={file}
                  onClick={() => setCurrentFile(file)}
                  className={`px-2 py-1 rounded-md ${currentFile === file ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-100'}`}
                >
                  {file}
                </button>
              ))}
              <button
                onClick={async () => {
                  if (!webContainer) return;
                  await webContainer.mount(fileTree);
                  const installProcess = await webContainer.spawn("npm", ["install"]);
                  installProcess.output.pipeTo(new WritableStream({ write(chunk) { console.log(chunk); } }));
                  await installProcess.exit;
                  const runProcess = await webContainer.spawn("npm", ["start"]);
                  runProcess.output.pipeTo(new WritableStream({ write(chunk) { console.log(chunk); } }));
                  setRunProcess(runProcess);
                }}
                className='px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 ml-auto'
              >
                Run
              </button>
            </div>

            {/* Editor */}
            {currentFile && (
              <textarea
                value={fileTree[currentFile]?.file.contents || ""}
                onChange={(e) => setFileTree({
                  ...fileTree,
                  [currentFile]: { ...fileTree[currentFile], file: { ...fileTree[currentFile].file, contents: e.target.value } }
                })}
                className='grow w-full p-3 bg-gray-900 text-white font-mono rounded-md outline-none'
              />
            )}
          </div>
        </div>
      </section>

      {/* Add Users Modal */}
      {isModelOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center'>
          <div className='bg-gray-800 p-4 rounded-md w-96 max-w-full'>
            <header className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-white'>Select Users</h2>
              <button onClick={() => setIsModelOpen(false)}>Close</button>
            </header>
            <div className='flex flex-col gap-2 max-h-96 overflow-auto'>
              {users.map(u => (
                <div key={u._id} className={`p-2 flex gap-2 items-center rounded-md cursor-pointer ${Array.from(selectedUserId).includes(u._id) ? 'bg-indigo-600' : 'bg-gray-700'} hover:bg-indigo-500`} onClick={() => handelUserClick(u._id)}>
                  <i className="ri-user-fill text-white"></i>
                  <span className='text-white'>{u.email}</span>
                </div>
              ))}
            </div>
            <button onClick={addCollaborators} className='mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-full'>Add Collaborators</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
