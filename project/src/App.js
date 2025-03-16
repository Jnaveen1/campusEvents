import './App.css';
import {BrowserRouter as Router,Routes, Route} from 'react-router-dom'
import Registration from './components/Registration'
import Login from './components/Login'
import WelcomePage from './components/WelcomePage'
import Home from './components/Home'
import RegisteredEvents from './components/RegisteredEvents'
import ProtectedRoute from './ProtectedRoute';
import Admin from './components/Admin';
import MyEvents from './components/MyEvents';
import FeedbackModal from './components/FeedbackModal';
import FeedbackAnalysis from './components/FeedbackAnalysis'
import Forgetpassword from './components/Forgetpassword';
import ResetPassword from './components/ResetPassword';
function App() {
  return (
    <div className="App">
      <Router>
          <Routes>
            <Route path='/' element={<WelcomePage/>} />
            <Route path='/register' element={<Registration/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path='/registeredEvents' element={<ProtectedRoute><RegisteredEvents /> </ProtectedRoute>} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/myevents" element={<MyEvents />} />
            <Route path = "/feedback" element= {<FeedbackModal/>} />
            <Route path = "/feedback-analysis" element= {<FeedbackAnalysis/>} />
            <Route path = '/forget-password' element= {<Forgetpassword/>} />
            <Route path = '/reset-link' element= {<ResetPassword/>} />
          </Routes>
        </Router>
    </div>
  );
}

export default App;
