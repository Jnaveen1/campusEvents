import React, {useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import EventForm from '../EventForm';
import Event from '../Event';
import Header from '../Header';
import RegistrationModal from '../RegistrationModal';
import Cookies from 'js-cookie';

import './index.css'
 function Home() {
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
  const location = useLocation() 

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
  }, [location]);


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
    if (userRole === 'organizer') {
      setAllow(true)
    } else {
      alert('Access Denied: Only organizers can create events.');
    }
  };

  const onRegister = async (id, data ) => {
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
      <h1 className='heading'>Welcome to the Home Page</h1>
      {userRole === 'admin' && <Navigate to = "/admin"/>}
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
                
                <button className='reset-btn' onClick={onClickResetBtn}>Reset</button>
            </div>

              <h1>Upcoming Events</h1>
              <ul className='EventContainer'>
                {filterData.some(event => event.status === 'approved' && new Date(event.event_date) > new Date()) ? 
                  (filterData
                  .filter(event => event.status === 'approved' && new Date(event.event_date) > new Date())
                  .map(event => (
                    <Event event={event} 
                          key={event.id} 
                          eventId={event.id} 
                          registerEvent  ={handleRegisterButtonClick} 
                          EventStatus = "YES"
                      />
                  ))) : (
                    <img src = "https://i.pinimg.com/736x/a1/16/72/a1167211bffbc81f616db1ef850aee2d.jpg" className='no-upcoming-events-found-image' />
                  )}
              </ul>
              <h1>Previous Events</h1>
              <ul className='EventContainer'>
              {filterData.some(event => event.status === 'approved' && new Date(event.event_date) < new Date()) ? 
                filterData
                .filter(event => event.status === 'approved' && new Date(event.event_date) < new Date())
                .map(event => (
                  <Event event={event} 
                        key={event.id} 
                        eventId={event.id} 
                        registerEvent  ={handleRegisterButtonClick} 
                        EventStatus = "NO"
                    />
                )) :(
                  <img src = "https://tse4.mm.bing.net/th?id=OIP.z9wmZ7NSS_CaDSvoU1FVMQAAAA&pid=Api&P=0&h=180" className='no-prevoius-events-found-image' />
                ) }
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
            />
          )}
        </div>
  );
}

export default Home;

