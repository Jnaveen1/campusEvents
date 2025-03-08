import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const sendOtp = async () => {
    try {
      const response = await fetch('http://localhost:3000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (response.ok) {
        setStep(2);
      } else {
        setError('Failed to send OTP. Try again.');
      }
    } catch (error) {
      setError('Something went wrong. Try again later.');
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await fetch('http://localhost:3000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      if (response.ok) {
        setOtpVerified(true);
        setError('');
        setStep(3);
        
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSuccess('Registration successful!');
        setFormData({ name: '', email: '', password: '', role: 'user' });
        setOtpVerified(false);
        setStep(1);
      } else {
        setError('Registration failed. Try again.');
      }
    } catch (error) {
      setError('Something went wrong. Try again later.');
    }
  };

  return (
    <div className="app-container">
      <div className='login-container'>
      <h2>Register</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      
      <form onSubmit={handleSubmit}  className='register-form'>
        {step === 1 && (
          <>
            <label>Email:</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />
            <button type='button' onClick={sendOtp} style={{ padding: '10px', width: '100%' }}>Send OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            <label>OTP:</label>
            <input
              type='text'
              placeholder='Enter OTP'
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />
            <button type='button' onClick={verifyOtp} style={{ padding: '10px', width: '100%' }}>Verify OTP</button>
          </>
        )}

        {step === 3 && otpVerified && (
          <>
            <label>Name:</label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />

            <label>Password:</label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />

            <label>Role:</label>
            <select
              name='role'
              value={formData.role}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            >
              <option value='user'>User</option>
              <option value='organizer'>Organizer</option>
            </select>

            <button type='submit' style={{ padding: '10px', width: '100%' }}>Register</button>
            
          </>
        )}
      </form>
      <Link to='/login'>
              <p>Already registered? Login</p>
      </Link>
      </div>
    </div>
  );
};

export default Registration;
