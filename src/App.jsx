import Home from './Home.jsx'
import Projects from './Projects.jsx'
import './App.css'

function App() {
  if (window.location.pathname.startsWith('/projects')) {
    return <Projects />
  }

  return <Home />
}

export default App
