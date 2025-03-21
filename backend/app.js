const express = require("express") ;
const app = express() ;
const {open} = require("sqlite")
const sqlite3 = require("sqlite3") 
app.use(express.json()) 
const path = require("path") ;
const dbPath = path.join(__dirname, "campus.db")
let db = null 
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer")
const crypto = require("crypto") 
const cron = require("node-cron") ;
const axios = require("axios");

const cors = require('cors');
const { stat } = require("fs");
const { emit } = require("process");

app.use(cors({
    origin: 'http://localhost:3001', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const initializeServer = async () =>{
    try{
        db = await open({
            filename: dbPath, 
            driver : sqlite3.Database 
        })
        app.listen(3000, ()=>{
            console.log("Server is running on port 3000....")
        })
    }catch(err){
        console.log("Error initializing server:", err.message)
    }
}

initializeServer() ;

const transporter = nodemailer.createTransport({
  secure : true , 
  host : "smtp.gmail.com", 
  port : 465 ,
  auth : {
    user : "naveenjanapati65@gmail.com", 
    pass : "cjyeygzztkpebglw"
  }
})

const generateOTP = () =>{
  return crypto.randomInt(100000, 999999).toString() ;
};

cron.schedule("0 9 * * *", async()=>{
  try{
    console.log("Running daily event remainder task....");
    const response = await axios("http://localhost:3000/send-event-reminders") ;
    console.log("Response :", response.data) ;
  }catch(error){
    console.error("Error in sending event reminders:", error.message);
  }
});

console.log("cron job is schedule to run at 9 AM daily");

//sending otp 
app.post("/send-otp", async (req, res) => {
  console.log("backend")
  const { email } = req.body;
  const otp = generateOTP();
  const expirationTime = Date.now() + 5 * 60 * 1000; 
  console.log(email)
  console.log(otp)
  try {
    await db.run(
      `INSERT INTO otps (email, otp, otp_expiration) VALUES (?, ?, ?) 
       ON CONFLICT(email) DO UPDATE SET otp = ?, otp_expiration = ?`,
      [email, otp, expirationTime, otp, expirationTime]
    );

    // Send OTP to email
    const mailOptions = {
      from: "naveenjanapati65@gmail.com",
      to: email,
      subject: "Your OTP for Registration",
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP. Try again." });
  }
});

//verify the otp
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await db.get(
      "SELECT * FROM otps WHERE email = ? AND otp = ? AND otp_expiration > ?",
      [email, otp, Date.now()]
    );

    if (user) {
      res.status(200).json({ message: "OTP verified successfully!" });
    } else {
      res.status(400).json({ message: "Invalid OTP or OTP expired." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP. Try again." });
  }
});

//register the new users 
app.post("/register", async(request, response)=>{
    const {name, email, password, role} = request.body 
    if (!name || !email || !password || !role || !  ['user', 'organizer'].includes(role)) {
        return response.status(400).json({ error: 'Invalid input' });
      }
      let query 
      try{
        const user = await db.get(
          "SELECT * FROM otps WHERE email = ? AND otp IS NULL",
          [email]
        );
        
        if (user) {
          res.status(400).json({ message: "OTP not verified." });
          return;
        }
    
        await db.run(
          "UPDATE otps SET otp = NULL, otp_expiration = NULL WHERE email = ?",
          [email]
        );
        query = `SELECT * FROM users WHERE email = ?`;
        const userExist = await db.get(query, [email]);
        if(userExist){
            return response.status(400).json({ error: "Email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        query = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
        await db.run(query, [name, email, hashedPassword, role])
        response.status(200).json("Registered Successfully.....")
      }catch(err){
        console.error("Error during registration:", err.message);
        response.status(500).json({ error: "Internal server error" });
      }
})

//reset the passowrd
app.post("/reset-link", async (request, response)=>{
  const {Email} = request.body 
  // console.log(Email)
    try{
    let query = 'select * from users where email = ?' ;
    
    const user = await db.get(query , [Email]) 
    // console.log(user)
    if(user === undefined){
      return response.status(400).send({message : "Email Doesn't Exist"})
    }
    const token = jwt.sign({email : user.email}, 'your_secret_key', { expiresIn: '10m' })
    // console.log(user.email)
    const resetLink = `http://localhost:3001/reset-link?token=${token}`
    const mailOptions = {
      from : "naveenjanapati65@gmail.com" ,
      to : Email, 
      subject : 'To Reset the password', 
      text : `Reset Password link is ${resetLink}`
    }

    await transporter.sendMail(mailOptions) ;
    response.status(200).send({message : "Reset password is send to the email.Check once.."})
    }
    catch(error){
      response.status(500).send({message : "Internal Error"})
    }
})

//update the password 
app.post('/update-passoword', async(request, response)=>{
  // console.log("update api")
  const {token, password} = request.body ;
  try{
    const decoded = jwt.verify(token, 'your_secret_key') ;
    const email = decoded.email ;
    // console.log(email)
    // console.log(password)
    const hashedPassword = await bcrypt.hash(password, 10) ;
    const query = 'update users set password = ? where email = ?' ;
    await db.run(query, [hashedPassword, email])
    response.status(200).send({message : "password Updated successfully"}) ;

  }catch(error){
    response.status(500).send({message : "Internal Error , Please try again."}) ;
  }
})

// login the existed users 
app.post('/login',async (req, res) => {
  // console.log("login")
  const { email, password } = req.body;

  if (!email || !password ) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  // console.log(password)

  const query = `SELECT * FROM users WHERE email = ?`;
  const user = await db.get(query , [email])
  console.log(user)
  if(user!=undefined){
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email,  role: user.role, username : user.name } , 'your_secret_key', { expiresIn: '1h' });
    console.log(token)
    res.status(200).json({ message: 'Login successful', token });
  }else{
    return res.status(400).json({ error: 'Invalid email or password' });
  }
 
});

//create the event by the organizer 
app.post('/create-event', async (req, res) => {
  const { title, description, event_type ,  location, event_date, status, userId } = req.body;
  if (!title || !location || !event_date) {
    return res.status(400).json({ error: 'All fields (title, location, event_date) are required.' });
  }

  try{
        const checkQuery = `
        SELECT * FROM campusevent
        WHERE location = ? AND event_date = ?
      `;
      
      const row = await db.get(checkQuery, [location, event_date]) 
      if(row){
        return res.status(400).json({ error: 'Event already exists at this location on the selected date.' });
      }

      const insertQuery = `
      INSERT INTO campusevent (title, description, location, event_date, eventType, status, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

      await db.run(insertQuery, [title, description, location, event_date, event_type, status, userId]) ;
      res.status(200).json("event Created....")
  }catch(err){
    console.error("Error during creation:", err.message);
    response.status(500).json({ error: "Internal server error" });
  }
});

//get the all events to display on the user interface
app.get("/events", async (request, response)=>{
  try{
    const query = `SELECT * FROM campusevent`
    const result = await db.all(query) ;
    response.status(200).json(result) ;
  }catch(error){
    console.error("Error during creation:", err.message);
    response.status(500).json({error: "Internal server error"})
  }
})

//to approve the event by the admin 
app.put("/approve-event/:eventId", async (request, response) => {
  const { eventId } = request.params; 
  const { status } = request.body;   
  if (!["approved", "pending"].includes(status)) {
    return response.status(400).json({ error: "Invalid status value" });
  }
  try {

    let query = `UPDATE campusevent SET status = ? WHERE id = ?`;
    const params = [status, eventId];
    const result = await db.run(query, params);
    
    // if (result.changes === 0) {
    //   return response.status(404).json({ error: "Event not found" });
    // }

    query = 'select email from users INNER JOIN campusevent on users.id = campusevent.user_id where campusevent.id = ?';
    const email = await db.get(query, [eventId]) 
    // console.log(email)
    let mailOptions = {
      from: "naveenjanapati65@gmail.com",
      to: email.email,
      subject: "Event Approved",
      text: `Your Event is Approved. All the Best for your event`,
    };
    await transporter.sendMail(mailOptions)

    query = 'select email from users'
    const usersEmails = await db.all(query) 
    const emailsList = usersEmails.map(user => user.email);
    // console.log(emailsList)

    const emailPromises = emailsList.map(email => {
      let options = {
        from: "naveenjanapati65@gmail.com",
        to: email,
        subject: "New Event Approved",
        text: `A new event has been approved! Check it out.`,
      };
      return transporter.sendMail(options);
    });

    await Promise.all(emailPromises);
    
    response.status(200).json({ message: "Approved the Event" });
    console.log(`Event with ID ${eventId} approved successfully.`);
  } catch (err) {
    console.error("Error during Approve:", err.message);
    response.status(500).json({ error: "Internal server error" });
  }
});

// reject the event by the admin
app.put("/reject-event/:eventId", async (request, response)=>{
  try{
    const {eventId} = request.params ;
    const {reason} = request.body ;
    console.log(`The event with eventId ${eventId} is rejected with reason ${reason}`)
    const query = `update campusevent set status = ? , rejection_reason = ? where id = ? `
    const params = ["rejected", reason, eventId] ;
    await db.run(query, params) ;
    response.status(200).json({message : "The Event is rejected"})
    console.log( "Admin rejected the event with id : " , eventId)
  }
  catch(err){
    console.error("Error during Approve:", err.message);
    response.status(500).json({ error: "Internal server error" });
  }
})

// register for the event 
app.post("/register-event/:id", async (request, response) => {
  console.log("NANa")
  const { id } = request.params;
    const { eventTitle, email, name, phoneNumber, userId } = request.body;
  console.log("naveen1")
    try {
      console.log("naveen12")

      const checkQuery = `
            SELECT * FROM EventRegistrations 
            WHERE event_id = $1 AND email = $2;
        `;
        console.log("hi")
        const checkResult = await db.get(checkQuery, [id, email]);
        
      console.log(checkResult)
        if (checkResult) {
            return response.status(400).json({ message: "User is already registered for this event!" });
        }

        const insertQuery = `
            INSERT INTO EventRegistrations (event_id, event_title, email, username, phone_number, user_id) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;

        const result = await db.run(insertQuery, [id, eventTitle, email, name, phoneNumber, userId]);

        console.log("Registration saved:", result);
        response.json({ message: "Registration successful!", data: result });
    } catch (error) {
        console.error("Error saving registration:", error);
        response.status(500).json({ error: "Failed to register event" });
    }
});

//To get regsitered events by users 
app.get("/registered-events", async(request, response)=>{
   const {email} = request.query ;
   try{
    const query = `select * from campusevent c JOIN  EventRegistrations e ON c.id = e.event_id AND e.email = ? `
    const result = await db.all(query, [email]) ;
    response.json(result) ; 

   }catch (error) {
    console.error("Error saving registration:", error);
    response.status(500).json({ error: "Failed to register event" });
  }
})


//fetching and seding the mails to users who regsitered for the event,  before 24hrs 
app.post("/send-event-reminders", async (request, response)=>{
  try{
    const users = await db.all(`
          select event_title , email FROM EventRegistrations WHERE event_id IN(
            SELECT event_id FROM EventRegistrations WHERE DATE(registered_at, '+1 day') = DATE('now', '+1 day') || (registered_at) = DATE('now')
          )
      `);

      if(users.length === 0){
        return response.status(200).json({message: "No upcoming events for remainders. "});
      }

      for(let user of users){
        const mailoptions = {
          from : "naveenjanapati65@gmail.com", 
          to : user.email, 
          subject : "Event Remainder: " + user.event_title, 
          text :`Hello , Your event "${user.event_title}" is happening soon!`, 
        };
        await transporter.sendMail(mailoptions) ;
      }
      return response.status(200).json({message : "Event Reminders are sent successfully!"}) ;
  }catch(error){
    console.error("Error sending remaiders:", error);
    response.status(500).json({message : "Failed to send the mails. Try again."})
  }
});

// to get the details of the evetns conducted by the organizer 
app.get("/organizer-events/:id", async (req, res) => {
  try {
    const { id } = req.params;   
    console.log("Organizer ID:", id);  

    const events = await db.all("SELECT * FROM campusevent WHERE user_id = ?", [id]);

    // if (!events || events.length === 0) {
    //   return res.status(200).json({ message: "No events found for this organizer" });
    // }

    res.json(events);
  } catch (error) {
    console.error("Error fetching organizer events:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

//save feedback in database 

app.post('/submit-feedback', async (request, response)=>{
  try{
    const {eventId, rating, comment, userId} = request.body
    console.log(eventId)
    console.log(rating)
    console.log(comment)
    console.log(userId)
    let query ;
    query = 'select * from feedback where user_id = ? and event_id = ? ' ;
    const checkFeddback = await db.run(query,  [userId ,eventId]);
    if(checkFeddback != undefined){
      return response.status(404).json({message : "Already Submitted the feedback of this event"})
    }
    query = `insert into feedback (event_id , user_id, rating, comment) values(?, ?, ?, ?)`
    const params = [eventId, userId, rating, comment] ;
    await db.run(query, params)
    response.status(200).json({message : "Thank You!"})
  }catch(error){
    console.log("Internal Server error!", error)
    response.status(500).json({message : "Internal Server"})
  } 
})

//retieve feedbacks 
app.get("/feedbacks", async(request, response)=>{
  try{
    let query ;
    query = `SELECT e.id AS EventId, e.title AS EventTitle, e.user_id as organizerId , COUNT(er.user_id) AS NoOfRegistrations
            FROM campusevent AS e
            LEFT JOIN EventRegistrations AS er ON e.id = er.event_id
            WHERE DATE(e.event_date) < DATE('now')
            GROUP BY e.id;
            `
    const registeredUsers = await db.all(query) ;
    console.log(registeredUsers)
    query = `select e.id as EventId, e.title as EventTitle,  count(f.id) as NoOfFeedbacks , 
    SUM(CASE WHEN f.rating = 5 THEN 1 ELSE 0 END) as rating_5 , 
    SUM(CASE WHEN f.rating = 4.5 THEN 1 ELSE 0 END)as rating_4_5,
    SUM(CASE WHEN f.rating = 4 THEN 1 ELSE 0 END)as rating_4,
    SUM(CASE WHEN f.rating = 3.5 THEN 1 ELSE 0 END)as rating_3_5,
    SUM(CASE WHEN f.rating = 3 THEN 1 ELSE 0 END)as rating_3,
    SUM(CASE WHEN f.rating = 2.5 THEN 1 ELSE 0 END)as rating_2_5, 
    SUM(CASE WHEN f.rating = 2 THEN 1 ELSE 0 END)as rating_2,
    SUM(CASE WHEN f.rating = 1.5 THEN 1 ELSE 0 END)as rating_1_5 ,
    SUM(CASE WHEN f.rating = 1 THEN 1 ELSE 0 END)as rating_1,
    SUM(CASE WHEN f.rating = 0.5 THEN 1 ELSE 0 END)as rating_0_5
    from campusevent as e LEFT JOIN feedback as f ON e.id = f.event_id WHERE DATE(e.event_date) < DATE('now') group by e.id` 
    console.log("heelo")
    const feedstats = await db.all(query);
    console.log(feedstats)
    const event_stats = registeredUsers.map(eachEvent=>{
      const feedbackData = feedstats.find(eachFeedback => eachEvent.EventId === eachFeedback.EventId) || {} ;
      return {
        event_id : eachEvent.EventId , 
        event_title : eachEvent.EventTitle ,
        organizer_id : eachEvent.organizerId, 
        registererd_users : eachEvent.NoOfRegistrations ,
        total_feedbacks : feedbackData.NoOfFeedbacks , 
        rating_5: feedbackData.rating_5 || 0,
        rating_4_5: feedbackData.rating_4_5 || 0,
        rating_4: feedbackData.rating_4 || 0,
        rating_3_5: feedbackData.rating_3_5 || 0,
        rating_3: feedbackData.rating_3 || 0,
        rating_2_5: feedbackData.rating_2_5 || 0,
        rating_2: feedbackData.rating_2 || 0,
        rating_1_5: feedbackData.rating_1_5 || 0,
        rating_1: feedbackData.rating_1 || 0,
        rating_0_5 :feedbackData.rating_0_5 || 0 ,
      }
    })

    response.status(200).json(event_stats);
    console.log("completed Feedback Analysis Task...")
  }
  catch(error){
    console.log("Error Occured try Again.")
    response.status(500).json({message :"Internal Error"})
  }
})


//get details of particular event thriugh id of event
app.get("/event-details/:id", async(request, response)=>{
  const {id} = request.params ;
  console.log(id)
  try{
    let query ;
    query = `select * from campusevent where id = ?` ;
    const event = await db.get(query, [id]) ;
    console.log(event)
    query = `select e.username, f.rating, f.comment from EventRegistrations as e LEFT JOIN feedback as f ON e.event_id = f.event_id  where e.event_id = ?` 
    const registeredUsers = await db.all(query ,[id]) ;
    if(registeredUsers !== undefined){
      response.status(200).json({event : event , registeredUsers : registeredUsers})
    }else{
      response.status(200).json({message : 'No Events are Found'})
    }
  }catch(error){
    response.status(500).json({message : "Internal Error.."}) ;
  }
})