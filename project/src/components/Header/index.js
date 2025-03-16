import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import './index.css'

const Header = () =>{
    const [showDropdown, setShowDropdown] = useState(false);
    const token = Cookies.get("jwtToken") ;
    const decode = jwtDecode(token) ;
    const userRole = decode.role  ;
    const userName = decode.username ;
    const id = decode.id ;
    console.log(id, userName, userRole)
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

    const onClickAnalysis = () =>{
        navigate("/feedback-analysis")
    }

    return(
        <div className="header-container">
            <Link to = "/home"> 
            <img 
                src="https://res.cloudinary.com/dkhdhl0aw/image/upload/v1740389540/DALL_E_2025-02-24_15.00.16_-_A_sophisticated_and_creative_logo_where_an_intricate_design_is_the_main_focus_with_the_letters_JVN_subtly_embedded_in_the_background._The_design_sh_fzi2hh.webp" 
                alt="JVN Logo" 
                className="logo"
            />
            </Link>
            <div className="header-buttons">
                <button onClick={onClickHome}>Home</button>
                <button onClick={onClickRegisteredEvents}>Registered Events</button>
                {(userRole === "admin" || userRole === "organizer") && (
                    <button type="button" onClick={onClickMyEvents}>My Events</button>
                )}
                {userRole === 'admin' && <button type = "button" onClick={onClickAnalysis}>Analysis</button>}
                {/* <button type="button" onClick={onClickLogout}>Logout</button> */}
                <div  onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
                    <button className="profile-btn">
                    <img src="/profile-icon.png" alt="Profile" className="profile-icon" />
                    </button>
                    {showDropdown && (
                        <div className="dropdown-menu">
                            <p>{userName}</p>
                            <p>{userRole}</p>
                            <button onClick={onClickLogout}>Logout</button>
                        </div>
                    )}
                </div>
                
            </div>
        </div>

    )
}

export default Header 
