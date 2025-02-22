import './index.css'

const Event = (props) =>{
    const {event, key, eventId, rejectEvent, approveEvent, registerEvent, EventStatus } = props 
    const {title,description,  location, event_date} = event

    const onclickEventApprove = () =>{
        approveEvent(eventId)
    }

    const onclickEventRegister = () =>{
        registerEvent(eventId, title) 
    }

    return(
            <li key={event.id} className='Event-Box'>
              <strong>Event Name :</strong> {title}<br/><strong>Location : </strong>{location.toUpperCase()} on {event_date}<br/><strong>Description :</strong> {description}<br/>
              {event.status === 'pending' && <button onClick={onclickEventApprove} type = "button">Approve</button> }
              {EventStatus == "YES" && <button  onClick={onclickEventRegister} type = "button">Register</button> }
            </li>
    )
}

export default Event ;