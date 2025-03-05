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

// login the existed users 
app.post('/login',async (req, res) => {
  console.log("login")
  const { email, password } = req.body;

  if (!email || !password ) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  console.log(password)

  const query = `SELECT * FROM users WHERE email = ?`;
  const user = await db.get(query , [email])
  if(user!=undefined){
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email,  role: user.role } , 'your_secret_key', { expiresIn: '1h' });
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
app.put("/approve-event:eventId", async (request, response) => {
  const { eventId } = request.params; 
  const { status } = request.body;   

  if (!["approved", "pending"].includes(status)) {
    return response.status(400).json({ error: "Invalid status value" });
  }

  try {

    const query = `UPDATE campusevent SET status = ? WHERE id = ?`;
    const params = [status, eventId];

    const result = await db.run(query, params);

    if (result.changes === 0) {
      return response.status(404).json({ error: "Event not found" });
    }

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
    const { eventTitle, email, name, phoneNumber } = request.body;
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
            INSERT INTO EventRegistrations (event_id, event_title, email, username, phone_number) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;

        const result = await db.run(insertQuery, [id, eventTitle, email, name, phoneNumber]);

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

    if (!events || events.length === 0) {
      return res.status(404).json({ message: "No events found for this organizer" });
    }

    res.json(events);
  } catch (error) {
    console.error("Error fetching organizer events:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
