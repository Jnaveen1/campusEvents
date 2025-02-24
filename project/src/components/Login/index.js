import React, { useState } from 'react';
import { useNavigate , Link} from 'react-router-dom';
import Cookies from 'js-cookie'
import './index.css'

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
        console.log("nana")
        const response = await fetch('http://localhost:3000/login', options);
        console.log(response)
        console.log("jvn")
        if(response.ok){
          console.log("naveen")
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
    <div className='login-main-container'>
    <div className='login-container'>
      <h2 className='login-title'>Login</h2>
      {error && <div className='error-message'>{error}</div>}
      <form onSubmit={handleSubmit} className='login-form'>
        <div className='input-group'>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className='input-field'
          />
        </div>

        <div className="input-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            className='input-field'
          />
        </div>

        <button type="submit" className='login-btn'>
          Login
        </button>
        <Link to='/register'>
        <p>Don't have Account?Register.</p>
      </Link>
      </form>
    </div>
    </div>
  );
};

export default LoginForm;
