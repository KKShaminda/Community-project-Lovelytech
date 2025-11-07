import './App.css';
import NavBar from './components/NavBar/NavBar';
import Hero from './pages/homepage/Hero/Hero';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <div className="App">
      <NavBar />
      <br/>
      <Hero />
      <Footer />
    </div>
  );
}

export default App;
