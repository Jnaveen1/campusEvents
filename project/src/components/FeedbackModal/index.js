import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import ReactStars from "react-stars";
import Cookies from 'js-cookie'
import './index.css'

const FeedbackModal = (props) => {
  const {eventId, onClose} = props 
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const token = Cookies.get("jwtToken");
  const decodedToken = jwtDecode(token) ;
  const userId = decodedToken.id ;
  const handleSubmit = async () => {
    try{
        console.log(rating)
        console.log(comment)
        const details = {
            eventId,
            userId ,
            rating : rating, 
            comment : comment
        }
        const options = {
            method : 'POST',
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(details)
        }
        const result = await fetch("http://localhost:3000/submit-feedback", options);
        if(result.ok){
            alert("Feedback Submitted! Thank You.")
            onClose()
        }else{
            const mssg = await result.json()
            alert(mssg.message)
        }
    }catch(error){
        console.log("Failed to send the Feedback", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <h2 className="text-lg font-semibold mb-4">Give Feedback</h2>

        <div className="flex justify-center mb-4">
          <ReactStars
            count={5}
            size={40}
            value={rating}
            onChange={(newRating) => setRating(newRating)}
            activeColor="#ffd700"
          />
        </div>

        <textarea
          className="w-full border p-2 mt-2"
          placeholder="Write your feedback..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="button px-4 py-2 bg-gray-300 rounded">Close</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
