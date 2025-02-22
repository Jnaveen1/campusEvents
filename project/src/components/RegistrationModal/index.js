import React, { useState } from 'react';
import './index.css'; 
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'
const RegistrationModal = ({ eventId, eventTitle, onClose, onRegister }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    eventTitle,
  });

  const token = Cookies.get('jwtToken');
  const decodedToken = jwtDecode(token);
  const userEmail = decodedToken.email;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {

    setIsSubmitting(true);
    try {
      formData['email'] = userEmail
      formData['id'] = eventId
      await onRegister(eventId, formData); 
      setConfirmation(true);
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
      <button className="close-btn" onClick={onClose}>X</button>
        {confirmation ? (
          <div>
            <h2>Thank You!</h2>
            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <div>
            
            <h2>Register for {eventTitle}</h2>

            <form onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userEmail}
                  readOnly
                  required
                />
              </div>
              <div>
                <label htmlFor="phoneNumber">Phone Number:</label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Confirm Registration'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationModal;
