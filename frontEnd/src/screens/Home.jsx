import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios.js";
import { useNavigate} from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const navigate = useNavigate();

  function createProject(e) {
    e.preventDefault()
    console.log({ projectName })

    axios.post('/projects/create', {
      name: projectName,
    })
    .then((res) => {
      console.log(res)
      setIsModelOpen(false)
    })
    .catch((error) => {
      console.log(error)
    })
  }

  useEffect(()=>{
    axios.get('/projects/all').then((res)=>{
      setProject(res.data.projects)
      // console.log(res);
    })
  },[])



return (
  <div className="min-h-screen bg-black text-gray-100 relative overflow-hidden">

    {/* Background glow */}
    <div className="absolute w-72 h-72 bg-indigo-600/20 blur-3xl rounded-full -top-10 -left-10"></div>
    <div className="absolute w-72 h-72 bg-purple-600/20 blur-3xl rounded-full bottom-0 right-0"></div>

    {/* Header */}
    <header className="relative z-10 flex items-center justify-between px-8 py-6">
      <h1 className="text-2xl font-extrabold tracking-wide">
        <span className="text-indigo-500">AI</span>{" "}
        <span className="text-white">Developer</span>
      </h1>
    </header>

    {/* Main */}
    <main className="relative z-10 px-8 mt-8">

      {/* Projects */}
      <div className="projects flex flex-wrap gap-4">

        {/* New Project */}
        <button
          onClick={() => setIsModelOpen(true)}
          className="project p-6 min-w-52 rounded-xl border border-gray-800 
          bg-black/50 hover:border-indigo-500 hover:bg-black/70 transition"
        >
          <h2 className="font-semibold text-lg">New Project</h2>
          <p className="text-sm text-gray-400 mt-1">
            Create a new workspace
          </p>
        </button>

        {/* Project Cards */}
        {project.map((project) => (
          <div
            key={project._id}
            onClick={() => {
              navigate(`/project`, { state: { project } });
            }}
            className="project flex flex-col gap-2 p-6 min-w-52 cursor-pointer
            rounded-xl border border-gray-800 bg-black/50
            hover:border-indigo-500 hover:bg-black/70 transition"
          >
            <h2 className="font-semibold text-lg">{project.name}</h2>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <i className="ri-user-line"></i>
              <span>{project.users.length} collaborators</span>
            </div>
          </div>
        ))}
      </div>
    </main>

    {/* Create Project Modal */}
    {isModelOpen && (
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-black border border-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

          <form onSubmit={createProject}>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Project Name
              </label>
              <input
                onChange={(e) => setProjectName(e.target.value)}
                value={projectName}
                type="text"
                className="w-full px-4 py-3 rounded-lg 
                bg-black/50 border border-gray-700 
                text-gray-100 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModelOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);

};

export default Home;
