import './App.css';
import NavBar from './components/NavBar/NavBar';
import Hero from './pages/homepage/Hero/Hero';
import Brands from './pages/homepage/Brands/Brands';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <div className="App">
      <NavBar />
      <Hero />
      <Brands />
      <Footer />
    </div>
  );
}

export default App;
