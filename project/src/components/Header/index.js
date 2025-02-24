import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

import { useNavigate } from 'react-router-dom'
import './index.css'

const Header = () =>{
    const token = Cookies.get("jwtToken") ;
    const decode = jwtDecode(token) ;
    const userRole = decode.role  ;
    const navigate = useNavigate() 

    const onClickLogout = () =>{
        Cookies.remove("jwtToken")
        navigate("/login")
    }

    const onClickRegisteredEvents = () =>{
        navigate("/registeredEvents") ;
    }

    const onClickHome = () =>{
        navigate("/home") ;
    }

    const onClickMyEvents = () =>{
        navigate("/myevents");
    }

    return(
        <div>
            <button onClick={onClickHome}>Home</button>
            <button onClick={onClickRegisteredEvents}>Registered Events</button>
            <button type="button" onClick={onClickLogout}>Logout</button>
            {(userRole === "admin" || userRole === "organizer" ) && <button type='button' onClick={onClickMyEvents}>My Events</button> }
        </div>
    )
}

export default Header 
