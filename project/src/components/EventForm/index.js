import React, { useState } from 'react';
import './index.css'
const EventForm = () => {

  const [filters, setFilters] = useState({
    loaction : '', 
    type : '', 
    date : '', 
  })

  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    eventType: '', 
    eventDescription: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { eventName, eventDate, eventType ,eventLocation, eventDescription } = formData;

    if (!eventName || !eventDate || !eventType || !eventLocation || !eventDescription) {
      setError('All fields are required!');
      return;
    }

    if(new Date(eventDate) < new Date()){
      setError("Select Valid Date")
      return 
    }
    

    const eventDetails = {
        title: eventName, 
        description: eventDescription,
        location: eventLocation.toLowerCase(), 
        event_type : eventType,
        event_date: eventDate
    };

    console.log(eventDetails);

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventDetails),
    };

    try {
        const response = await fetch('http://localhost:3000/create-event', options);
        console.log(response)
        if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.error || 'Event creation failed');
            return;
        }

        const successData = await response.json();
        setSuccess(successData.message || 'Event created successfully!');
        
        // Reset form fields after successful submission
        setFormData({
            eventName: '',
            eventDate: '',
            eventLocation: '',
            eventType : '' ,
            eventDescription: '',
        });



    } catch (err) {
        setError('Something went wrong, please try again later.');
        console.error('Error during event creation:', err);
    }
};

  return (
    <div>
      <h2>Create Event</h2>
      {error && <p style={{ color: 'red' }} >{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit} className='event-creation-container'>
        <div>
          <label>Event Name:</label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Event Date:</label>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Event Location:</label>
          <input
            type="text"
            name="eventLocation"
            value={formData.eventLocation}
            onChange={handleChange}
          />
        </div>
        <div>
        <label>Event Type:</label>
          <select name = "eventType" onChange = {handleChange}>
            <option value="">Select Event Type</option>
            <option value = 'WorkShop'>WorkShop</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value = "Sports">sports</option>
          </select>
        </div>
        <div>
          <label>Event Description:</label>
          <textarea
            name="eventDescription"
            value={formData.eventDescription}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default EventForm;
