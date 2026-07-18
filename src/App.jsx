import Home from './Home.jsx'
import Projects from './Projects.jsx'
import AboutUs from './AboutUs.jsx'
import './App.css'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  const pathname = window.location.pathname

  if (
    pathname.startsWith(base + '/about') ||
    pathname.startsWith(base + '/about-us')
  ) {
    return <AboutUs />
  }

  if (pathname.startsWith(base + '/projects')) {
    return <Projects />
  }

  return <Home />
}

export default App
