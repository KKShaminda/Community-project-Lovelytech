import logo from './logo.svg';
import './App.css';
<<<<<<< Updated upstream
=======
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignup from './components/LoginSignup/LoginSignup';

>>>>>>> Stashed changes

function App() {
  return (
    <div className="App">
<<<<<<< Updated upstream
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
=======
      <NavBar />
      <Router>
        <Routes>
          <Route path='/login' element={<LoginSignup/>} />
        </Routes>
      </Router>
      <Footer />
>>>>>>> Stashed changes
    </div>
  );
}

export default App;
