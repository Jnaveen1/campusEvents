import { use, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import './index.css'
import Header from '../Header';
import FeedbackModal from '../FeedbackModal'

const RegsiteredEvetns = (event) =>{
    const [events, setEvents] = useState([]) ;
    const [openFeedback , setFeedback] = useState();
    const token = Cookies.get("jwtToken") ;
    const decodedToken = jwtDecode(token);
    const email = decodedToken.email ;

    useEffect(() => {
        const fetchEvents = async () => {
          const response = await fetch(`http://localhost:3000/registered-events?email=${encodeURIComponent(email)}`);
          const data = await response.json();
          const formatData = data.map((eachEvent)=>({
            eventId : eachEvent.event_id,
            eventTitle : eachEvent.event_title,
            location : eachEvent.location,
            eventDate : eachEvent.event_date ,
            description : eachEvent.description
          }))
          console.log(formatData)
          setEvents(formatData);
        };
        fetchEvents();
      }, []);


    return(
            <div className='main-container'>
            <Header />
                {events.length === 0 ? (
                    <h1 className='heading'>No Registered Events</h1>
                ) : (
                    <div>
                        <ul className="EventContainer">
                            {events.map((event) => (
                                <li
                                key={event.eventId}
                                className='Event-Box'
                                >
                                    <h1 className="text-lg font-semibold">{event.eventTitle}</h1>
                                    <p><strong>About : </strong>{event.description}</p>
                                    <p><strong>Location : </strong>{event.location}</p>
                                    <p className="text-gray-600"><strong>Date : </strong>{event.eventDate}</p>
                                    { new Date(event.eventDate) <= new Date() ? <button type = "button" onClick = { ()=>setFeedback(event.eventId) }>Feedback</button> : <button>Get Ready</button>}
                                    {openFeedback === event.eventId ? <FeedbackModal eventId={event.eventId} onClose={() => setFeedback(false)} /> : ''}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) }
                
            </div>        
    )
}

export default RegsiteredEvetns ;