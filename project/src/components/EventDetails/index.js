import { useParams } from 'react-router-dom'
import './index.css'
import Header from '../Header'
import { useEffect, useState } from 'react'

const EventDetails = () =>{
    const {id} = useParams() 
    const [eventData , setEventData] = useState([])
    const [data, setData] = useState([]) ;

    const fetchEventDetails = async () =>{
        try{
            const options = {
                method : 'GET', 
                headers : {
                    "Content-Type" : "application/json" 
                },
            }
            const result = await fetch(`http://localhost:3000/event-details/${id}`, options);
            const data = await result.json() ;
            console.log(result)
            if(result.ok){
                console.log(data)
                setEventData(data.event)
                setData(data.registeredUsers)
            }
        }
        catch(error){
            console.log("Something went wrong, Try Again..")
        }
    }

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    return (
        <div>
            <Header />
            <div className='event-details'>
                <h1><strong>Title : </strong>{eventData.title}</h1>
                <p><strong>EventId : </strong>{eventData.id}</p>
                <p><strong>EventType : </strong>{eventData.eventType}</p>
                <p><strong>EventDate : </strong>{eventData.event_date}</p>
                <p><strong>Description : </strong>{eventData.description}</p>
                <p><strong>Location : </strong>{eventData.location}</p>
                <p><strong>OrganizerId : </strong>{eventData.user_id}</p>
            </div>

            {data.length === 0 ? <p>No Feedbacks</p> : 
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse"}} className='feedback-table'>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Rating</th>
                        <th>Comment</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((fb, index) => (
                        <tr key={index}>
                            <td>{fb.username}</td>
                            <td>{ fb.rating == undefined ? <p>-</p> : '⭐'.repeat(fb.rating)}</td>
                            <td>{fb.comment == undefined ? <p>-</p> : fb.comment}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            }

        </div>
    )
}

export default EventDetails