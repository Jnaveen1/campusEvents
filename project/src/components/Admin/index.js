import React, {useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import EventForm from '../EventForm';
import Event from '../Event';
import Header from '../Header';
import RegistrationModal from '../RegistrationModal';
import Cookies from 'js-cookie';

import './index.css'
 function Admin() {
  const token = Cookies.get('jwtToken');
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;
  const [isAllow, setAllow] = useState(false) ; 
  const [eventDetails , setEventData] = useState([]) ;
  const [filters, setFilters] = useState({
    location: '',
    date: '',
    type: '',
  });
  const [filterData, setFilterData] = useState([])
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEventId, setSelectedEvent] = useState(null); 
  const [selectedEventTitle, setSelectedEventTitle] = useState(null); 
  const [showModal, setShowModal] = useState(false); 

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:3000/events");
      if (response.ok) {
        const data = await response.json();
         console.log(data);
        setEventData(data)
        setFilterData(data)
      } else {
        console.error("Failed to fetch events: ", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };


  useEffect(() => {
    fetchEvents()
  }, []);


  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  
  useEffect(() => {
    const filteredEvents = eventDetails.filter((eachEvent) =>
      (!filters.location || eachEvent.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.date || eachEvent.event_date === filters.date) &&
      (!filters.type || eachEvent.eventType === filters.type)
    );
    setFilterData(filteredEvents);
  }, [filters, eventDetails]);

  const handleCreateEvent = () => {
    if (userRole === 'organizer' || userRole === 'admin') {
      setAllow(true)
    } else {
      alert('Access Denied: Only organizers can create events.');
    }
  };

  const approveEvent = async (eventId) =>{
      const detalis = {
        status : "approved"
      }
      const options = {
        method : "PUT", 
        headers : {"Content-Type" : "application/json"}, 
        body : JSON.stringify(detalis)
      }
      const result = await fetch(`http://localhost:3000/${eventId}`, options)
      if(result.ok){
        const data =await result.json()
        await fetchEvents()
      }
  }

  const rejectEvent = async (eventId) =>{
    const options = {
      method : "DELETE", 
      headers : {"Content-Type" : "application/json"}, 
    }

    const result = await fetch(`http://localhost:3000/reject-event/${eventId}`, options);
    if(result.ok){
      const data = await result.json()
      await fetchEvents()
    }
  }

  const onRegister = async (id, data) => {
    try {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data) 
        };

        const response = await fetch(`http://localhost:3000/register-event/${id}`, options);
        console.log(response)
        const responseData = await response.json();
        if (response.ok) {
            alert("Registered Successfully.....")
            console.log("Registration successful", responseData);
        } else {
            alert(responseData.message);
        }
    } catch (error) {
        console.error("Error registering for event:", error);
        alert("An error occurred while registering. Please try again.");
    }
  };

  const handleRegisterButtonClick = (id, title) => {
    console.log(title)
    if (registeredEvents.includes(id)) {
      alert('You are already registered for this event.');
      return;
    }
    setSelectedEventTitle(title)
    console.log(id)
    setSelectedEvent(id); 
    setShowModal(true); 
  };

  const onClickResetBtn = () =>{
    setFilters({
      date : '' ,
      location : '', 
      type : '',
    });
  }

  return (
    <div className='main-container'>
      <Header />
      <h1>Admin Page</h1>
      <div>
          <h2>Pending Events</h2>
              {eventDetails.filter(event => event.status === 'pending').length > 0 ? (
                <ul>
                  {eventDetails
                    .filter(event => event.status === 'pending')
                    .map(event => (
                      <Event event={event} 
                            key={event.id} 
                            eventId={event.id} 
                            rejectEvent = {rejectEvent} 
                            approveEvent = {approveEvent} 
                            registerEvent = {handleRegisterButtonClick} 
                        />
                    ))}
                </ul>
              ) : (
                <h3>No pending events</h3>
              )}
            </div>
          <br/>
          <h2>All Events</h2>
          {eventDetails.length > 0 ? (
            <>
            <div className="filter-container">
                <select name="type" onChange={handleFilterChange}>
                  <option value="">All Types</option>
                  <option value="WorkShop">Workshop</option>
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                </select>

                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  placeholder="Search by Location"
                  onChange={handleFilterChange}
                />

                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                />

                <button type = "button" onClick={onClickResetBtn}>Reset</button>

              </div>
              <h1>Upcoming Events</h1>
              <ul className='EventContainer'>
                {filterData
                  .filter(event => event.status === 'approved' && new Date(event.event_date) > new Date())
                  .map(event => (
                    <Event event={event} 
                          key={event.id} 
                          eventId={event.id} 
                          rejectEvent = {rejectEvent} 
                          approveEvent = {approveEvent} 
                          registerEvent  ={handleRegisterButtonClick} 
                          EventStatus = "YES"
                      />
                  ))}
              </ul>
              <h1>Previous Events</h1>
              <ul className='EventContainer'>
              {filterData
                .filter(event => event.status === 'approved' && new Date(event.event_date) < new Date())
                .map(event => (
                  <Event event={event} 
                        key={event.id} 
                        eventId={event.id} 
                        rejectEvent = {rejectEvent} 
                        approveEvent = {approveEvent} 
                        registerEvent  ={handleRegisterButtonClick} 
                        EventStatus = "NO"
                    />
                ))}
            </ul>
          </>
          ) : (
            <p>No events are found</p>
          )}
          {!isAllow ? (
            <button onClick={handleCreateEvent}>Create Event</button>
          ) : (
            <EventForm />
          )}
          {/* {userRole == 'oraganizer' && <button onClick={handleCreateEvent}>Create Event</button>}
          {isAllow && } */}
          {showModal && (
            <RegistrationModal 
              eventId={selectedEventId} 
              eventTitle= {selectedEventTitle}
              onClose={() => setShowModal(false)} 
              onRegister={onRegister}
              role={userRole}
            />
          )}
        </div>
  );
}

export default Admin;

