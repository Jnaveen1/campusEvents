import './index.css'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'

const Event = (props) => {
    const token = Cookies.get('jwtToken');
    const decode = jwtDecode(token)
    const userRole = decode.role 
    const { event, eventId, registerEvent, EventStatus } = props 
    const { title, description, location, event_date, status } = event

    const onclickEventRegister = () => {
        registerEvent(eventId, title) 
    }

    return (
        <li key={event.id} className='Event-Box'>
            <strong>Event Name :</strong> {title}<br/>
            <strong>Location : </strong>{location.toUpperCase()} on {event_date}<br/>
            <strong>Description :</strong> {description}<br/>

            {userRole === 'admin' && (
                <>
                    {status === 'pending' && (
                        <>
                            <button onClick={() => props.approveEvent(eventId)} type="button" className='approve-btn'>Approve</button>
                            <button onClick={() => props.rejectEvent(eventId)} type="button" className='reject-btn'>Reject</button>
                        </>
                    )}
                </>
            )}

            {EventStatus === "YES" && (
                <button onClick={onclickEventRegister} type="button">Register</button>
            )}
        </li>
    )
}

export default Event
