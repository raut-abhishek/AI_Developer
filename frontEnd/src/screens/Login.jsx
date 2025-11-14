import React from 'react'
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle login logic here (API call, validation, etc.)
    console.log("Login Data:", formData);
    navigate("/dashboard"); // redirect after login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 via-gray-900 to-black text-gray-100">
      <div className="w-full max-w-md bg-gray-900/70 backdrop-blur-lg border border-gray-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          AI Developer Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-white transition duration-200"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
