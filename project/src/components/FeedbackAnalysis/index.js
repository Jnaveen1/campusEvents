import { useEffect, useState } from "react";
import Header from "../Header";
import './index.css'
const AdminAnalysis = () => {
  const [feedbacksStats, setFeedbacks] = useState([]);
  const [filterData , setFilterData] = useState([]);
 
  useEffect(() => {
    fetch("http://localhost:3000/feedbacks") // API to get all feedbacks
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setFeedbacks(data);
        setFilterData(data)
      })
      .catch((err) => console.error("Error fetching feedback:", err));
  }, []);

  const handleEventAnalysisFilter = (event) => {
    const searchValue = event.target.value.toLowerCase();
  
    const filteredData = feedbacksStats.filter((eachData) =>
      eachData.event_title.toLowerCase().includes(searchValue)
    );
    setFilterData(filteredData)
  
    console.log(filteredData);
  };

  return (
    <div>
        <Header />
      <h1 className="heading text-2xl font-bold mb-4">Feedback Analysis</h1>
      <ul className="feedback-main-container">
        <input className="analysis-filter-input" type = "text" onChange = {handleEventAnalysisFilter} placeholder = "Search Events"/>
      {filterData.length === 0 ? <p>There is FeedBacks.</p> : (
        filterData.map((eachEventFeedback)=>
         <div key={eachEventFeedback.event_id} className="event-feedback-con">
            <h2>{eachEventFeedback.event_title}</h2>
            <p><strong>Total Registered Users:</strong> {eachEventFeedback.registererd_users}</p>
            <p><strong>Total Feedback Given:</strong> {eachEventFeedback.total_feedbacks}</p>
            <table border = '1' className="event-feedback-table">
              <thead>
                <tr>
                  <th className="table-data">Rating</th>
                  <th className="table-data">Count</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="table-data">⭐ 5</td><td>{eachEventFeedback.rating_5}</td></tr>
                <tr><td className="table-data">⭐ 4.5</td><td>{eachEventFeedback.rating_4_5}</td></tr>
                <tr><td className="table-data">⭐ 4</td><td>{eachEventFeedback.rating_4}</td></tr>
                <tr><td className="table-data">⭐ 3.5</td><td>{eachEventFeedback.rating_3_5}</td></tr>
                <tr><td className="table-data">⭐ 3</td><td>{eachEventFeedback.rating_3}</td></tr>
                <tr><td className="table-data">⭐ 2.5</td><td>{eachEventFeedback.rating_2_5}</td></tr>
                <tr><td className="table-data">⭐ 2</td><td>{eachEventFeedback.rating_2}</td></tr>
                <tr><td className="table-data">⭐ 1.5</td><td>{eachEventFeedback.rating_1_5}</td></tr>
                <tr><td className="table-data">⭐ 1</td><td>{eachEventFeedback.rating_1}</td></tr>
                <tr><td className="table-data">⭐ 0.5</td><td>{eachEventFeedback.rating_0_5}</td></tr>
              </tbody>
            </table>
      </div>
      )
    )}
    </ul>
    </div>
  );
};

export default AdminAnalysis;
