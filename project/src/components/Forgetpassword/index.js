import { useState } from 'react'
import './index.css'

const Forgetpassword = () =>{

    const [email, setEmail] = useState()

    const handleSubmitForm = async (event) =>{
        event.preventDefault() 
        console.log(email)
        if(email === undefined){
            alert("Enter the Registered Email.")
            return 
        }
        console.log("Ok Submitted")

        try{
        const options = {
            method : 'POST', 
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({Email : email})
        }

        await fetch("http://localhost:3000/reset-link", options);
        }
        catch(error){
            console.log(error.message)
        }
    }

    return (
        <div className='forget-main-container'>
            <div className='forget-container'>
                <h2>Forgot Password?</h2>
                <form onSubmit={handleSubmitForm}>
                <input type="email" placeholder="Enter Email" onChange = {(e) => setEmail(e.target.value) } />
                <button type="submit">Send Reset Link</button>
                </form>
            </div>
      </div>
  
    )
}

export default Forgetpassword 