import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import './index.css'
import Header from '../Header';

const RegsiteredEvetns = (event) =>{
    const [events, setEvents] = useState([]) 
    const token = Cookies.get("jwtToken")
    const decodedToken = jwtDecode(token);
    const email = decodedToken.email 

    useEffect(() => {
        const fetchEvents = async () => {
          const response = await fetch(`http://localhost:3000/registered-events?email=${encodeURIComponent(email)}`);
          const data = await response.json();
          const formatData = data.map((eachEvent)=>({
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
            <>
            <Header />
                {events.length === 0 ? (
                    <h1>No Registered Events</h1>
                ) : (
                    <div>
                        <ul className="space-y-3">
                            {events.map((event) => (
                                <li
                                key={event.id}
                                className="p-3 border rounded-lg shadow-md bg-white"
                                >
                                    <h1 className="text-lg font-semibold">{event.eventTitle}</h1>
                                    <p><strong>About : </strong>{event.description}</p>
                                    <p><strong>Location : </strong>{event.location}</p>
                                    <p className="text-gray-600"><strong>Date : </strong>{event.eventDate}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) }
            </>        
    )
}

export default RegsiteredEvetns ;