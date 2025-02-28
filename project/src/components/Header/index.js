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
        <div className="header-container">
            <img 
                src="https://res.cloudinary.com/dkhdhl0aw/image/upload/v1740389540/DALL_E_2025-02-24_15.00.16_-_A_sophisticated_and_creative_logo_where_an_intricate_design_is_the_main_focus_with_the_letters_JVN_subtly_embedded_in_the_background._The_design_sh_fzi2hh.webp" 
                alt="JVN Logo" 
                className="logo"
            />
            <div className="header-buttons">
                <button onClick={onClickHome}>Home</button>
                <button onClick={onClickRegisteredEvents}>Registered Events</button>
                {(userRole === "admin" || userRole === "organizer") && (
                    <button type="button" onClick={onClickMyEvents}>My Events</button>
                )}
                <button type="button" onClick={onClickLogout}>Logout</button>
            </div>
        </div>

    )
}

export default Header 
