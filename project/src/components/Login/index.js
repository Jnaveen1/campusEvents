import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setToken('')
    // Validate inputs
    if (!formData.email || !formData.password) {
        setError('Both fields are required');
        return;
    }

    const options = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    };
    console.log(formData)
    try {
        const response = await fetch('http://localhost:3000/login', options);
        console.log(response)
        if(response.ok){
            const data = await response.json();
            console.log(data.token)
            Cookies.set("jwtToken", data.token)
            navigate("/home")
        }
            const errorData = await response.json(); 
            setError(errorData.error || 'Login failed');
    } catch (err) {
        // Handle network or unexpected errors
        setError('Something went wrong. Please try again later.');
        console.error('Login Error:', err);
    }
};


  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Login</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', width: '100%' }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
