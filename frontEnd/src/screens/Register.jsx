import React from 'react'
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from '../config/axios.js';
import { UserContext } from '../context/user.context.jsx';

export default function Register() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/user/register', {
      email: formData.email,
      password: formData.password,
    }).then((res) => {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate("/");
    }).catch((err) => {
      console.log(err);
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
    bg-black text-gray-100 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute w-72 h-72 bg-indigo-600/20 blur-3xl rounded-full -top-10 -left-10"></div>
      <div className="absolute w-72 h-72 bg-purple-600/20 blur-3xl rounded-full bottom-0 right-0"></div>

      {/* Card */}
      <div className="relative w-full max-w-md p-8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)]">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-1">
          Create Account
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Join the AI Developer Platform
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm mb-2 text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg 
              bg-black/50 border border-gray-700 
              text-gray-100 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg 
              bg-black/50 border border-gray-700 
              text-gray-100 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 mt-2 
            bg-indigo-600 hover:bg-indigo-700 
            rounded-lg font-medium text-white
            transition duration-200 shadow-lg shadow-indigo-600/20"
          >
            Register
          </button>
        </form>

        {/* Switch */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
