import Home from './Home.jsx'
import Projects from './Projects.jsx'
import AboutUs from './AboutUs.jsx'
import './App.css'

function App() {
  if (
    window.location.pathname.startsWith('/about') ||
    window.location.pathname.startsWith('/about-us')
  ) {
    return <AboutUs />
  }

  if (window.location.pathname.startsWith('/projects')) {
    return <Projects />
  }

  return <Home />
}

export default App
