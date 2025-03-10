import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import "./index.css";
import Header from "../Header";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Decode user token
  const token = Cookies.get("jwtToken");
  const decoded = jwtDecode(token);
  const userRole = decoded.role;
  const organizerId = decoded.id; // Assuming the token has organizer ID

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
        console.log("My")
      try {
        const response = await fetch(`http://localhost:3000/organizer-events/${organizerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setLoading(false)
          setEvents(data);
        } else {
          console.error("Failed to fetch events:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
  
    fetchOrganizerEvents();
  }, [organizerId, token]);
  



  const deleteEvent = async (eventId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    try {
      await fetch(`https://your-backend-api.com/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(events.filter((event) => event.id !== eventId));
    } catch {
      alert("Failed to delete event");
    }
  };

  const resubmitEvent = async (eventId) => {
    try {
      await fetch(`https://your-backend-api.com/events/${eventId}/resubmit`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Event resubmitted for approval");
    } catch {
      alert("Failed to resubmit event");
    }
  };

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="main-container">
        <Header />
      <h2 className="heading">My Events</h2>
      {events.length === 0 ? <p>No events found</p> : (
        <ul className="EventContainer">
          {events.map((event) => (
            <li key={event.id} className= {event.status == 'rejected' ? "reject-Event-Box" : "approved-Event-Box"} >
              <p><strong>Title: </strong>{event.title}</p>
              <p><strong>About: </strong>{event.description}</p>
              <p><strong>Location: </strong>{event.location.toUpperCase()}</p>
              <p><strong>Status: </strong>{event.status}</p>
              
              {event.status === "pending" && (
                <button onClick={() => deleteEvent(event.id)}>Delete</button>
              )}
              {event.status === "rejected" && (
                  <p>The Event is rejected with reason : {event.rejection_reason}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyEvents;
//<button onClick={() => resubmitEvent(event.id)}>Resubmit</button>