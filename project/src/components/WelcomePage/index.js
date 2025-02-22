import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed from 'useHistory' to 'useNavigate'

function App() {
  const [isRegistering, setIsRegistering] = useState(false); // Tracks whether user is registering or logging in
  const navigate = useNavigate(); // Using useNavigate instead of useHistory

  const handleRegisterClick = () => {
    setIsRegistering(true); // Show registration form
    navigate('/register'); // Redirect to registration page
  };

  const handleLoginClick = () => {
    setIsRegistering(false); // Show login form
    navigate('/login'); // Redirect to login page
  };

  const handleAdminLoginClick = () => {
    setIsRegistering(false); // Show login form
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="App">
      <h1>Welcome to Our App</h1>
      <div>
        <button onClick={handleRegisterClick}>Register</button>
        <button onClick={handleLoginClick}>Login</button>
        <button onClick={handleAdminLoginClick}>Admin Login</button>
      </div>
    </div>
  );
}

export default App;
