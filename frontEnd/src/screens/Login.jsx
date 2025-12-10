import React from 'react'
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from '../config/axios.js';
import { UserContext } from '../context/user.context.jsx';

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('/user/login', {
      email: formData.email,
      password: formData.password,
    })
      .then((res) => {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate("/");
      })
      .catch((err) => {
        console.log(err.response?.data);
      });
  };

  return (
    <div className="min-h-screen w-full flex bg-black overflow-hidden">

      {/* LEFT SIDE - AI CONSOLE */}
      <div className="relative hidden lg:flex w-1/2 bg-[#060c1f] 
        items-center justify-center overflow-hidden">

        {/* Soft Diagonal Shape */}
        <div className="absolute top-0 right-0 w-full h-full bg-gray-950 
        clip-path-[polygon(0_0,100%_0,70%_100%,0_100%)]">
        </div>

        {/* Terminal Glow */}
        <div className="absolute inset-0 bg-gray-950 blur-[90px]"></div>

        {/* Terminal Text */}
        <pre className="relative z-10 text-cyan-300 font-mono text-sm md:text-base whitespace-pre-wrap px-10 opacity-80 leading-6">
          {`Initializing AI Developer System...
> Loading modules: core, compiler, intelligence, UI-engine
> Status: Optimal ✓

AI: "Hello Developer, authentication required."
AI: "Preparing secure environment..."
AI: "Awaiting your credentials..."`}
        </pre>
      </div>

      {/* RIGHT SIDE - LOGIN CARD */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">

        <div className="w-full max-w-md
          p-8 rounded-2xl shadow-xl">

          <h1 className="text-3xl font-bold text-white mb-6">
            Login to AI Developer
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label className="text-sm text-white/60">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 mt-2 rounded-lg bg-white/10 border border-white/20 
                text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-white/60">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 mt-2 rounded-lg bg-white/10 border border-white/20 
                text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-blue-600 
              text-white rounded-lg font-medium hover:opacity-90 transition 
              active:scale-95 shadow-lg shadow-cyan-500/30"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-white/60 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-cyan-300 hover:text-cyan-200">
              Create one
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
