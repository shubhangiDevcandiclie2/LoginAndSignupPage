import React, { useState } from "react";
import axios from "axios";
import './LoginSignup.css';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email.");
      return;
    }

    const endpoint = isLogin
      ? `${process.env.REACT_APP_API_URL}/api/login`
      : `${process.env.REACT_APP_API_URL}/api/signup`;

    try {
      const res = await axios.post(endpoint, formData);
      if (res.data.success) {
        alert(`${isLogin ? "Login" : "Signup"} successful!`);
        setFormData({ name: "", email: "", password: "" });
      } else {
        alert(res.data.message || `${isLogin ? "Login" : "Signup"} failed!`);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || `${isLogin ? "Login" : "Signup"} failed!`;
      alert(errorMessage);
    }
  };

  return (
    <div className="login-signup-container">
      <h2>{isLogin ? "Login" : "Signup"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{isLogin ? "Login" : "Signup"}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? "Signup" : "Login"}
      </button>
    </div>
  );
};

export default LoginSignup;
