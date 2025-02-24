import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css'; // Import the CSS file

function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    setIsRegistering(true);
    navigate('/register');
  };

  const handleLoginClick = () => {
    setIsRegistering(false);
    navigate('/login');
  };

  const handleAdminLoginClick = () => {
    setIsRegistering(false);
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className="content-box">
        <h1 className="app-title">Welcome to Our App</h1>
          <button className="btn" onClick={handleRegisterClick}>Register</button>
          <button className="btn" onClick={handleLoginClick}>Login</button>
          <button className="btn admin-btn" onClick={handleAdminLoginClick}>Admin Login</button>
      </div>
    </div>
  );
}

export default App;
