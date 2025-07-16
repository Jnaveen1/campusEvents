import { useEffect, useState } from 'react'
import './index.css'
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const ResetPassword = ()=>{
    const [password, setPassword] = useState()
    const [ConfirmPassword , setConfirmPassword] = useState() ;
    const [error, setError] = useState() ;
    const [token, setToken] = useState() ;
    const [searchParams] = useSearchParams() ;

    const navigate = useNavigate() ;

    useEffect(()=>{
        const urlToken = searchParams.get("token") 
        if(urlToken){
            setToken(urlToken)
            console.log(urlToken)
        }else{
            setError("Invalid Token")
        }
    }, [searchParams]) ;

    const handleSubmitForm = async (e) =>{
        console.log("nav")
        e.preventDefault() ;
        try{
            console.log(password)
            if(password !== ConfirmPassword){
                setError("Password and Confrim Password Should be the same.")
                return 
            }
            const details = {
                password, 
                token
            }
            const options = {
                method : 'POST', 
                headers :{
                    "Content-Type" : 'application/json'
                }, 
                body : JSON.stringify(details)
            }
            const response = await fetch('http://localhost:3000/update-passoword', options)
            const data = response.json() ;
            if(response.ok) {
                alert("Password is updated successfully..")
                setConfirmPassword('')
                setPassword('')
                navigate('/login')
                
            }else{
                setError(data.message)
            }

        }catch(error){
            setError("Something Went Wrong..")
        }   
    } 


    return(
        <div className='reset-main-container'>
            <form onSubmit={handleSubmitForm}  className='reset-container'>
                <label>Password</label>
                <input type = 'password' onChange={(e) => setPassword(e.target.value)} />
                <label>Confirm Password</label>
                <input type = 'password' onChange={(e) => setConfirmPassword(e.target.value)} />
                <button type= "submit">Submit</button>
                <p>{error}</p>

            </form>
        </div>
    )
}

export default ResetPassword 