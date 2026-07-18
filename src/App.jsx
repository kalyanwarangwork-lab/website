import { useState, useEffect } from 'react'
import Home from './Home.jsx'
import Projects from './Projects.jsx'
import AboutUs from './AboutUs.jsx'
import './App.css'

function getRoute() {
  const hash = window.location.hash.slice(1)
  if (hash === 'about') return 'about'
  if (hash) return 'projects'
  return 'home'
}

function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const onChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  if (route === 'about') return <AboutUs />
  if (route === 'projects') return <Projects />
  return <Home />
}

export default App
