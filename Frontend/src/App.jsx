import Dashboard from './components/Dashboard'
import './App.css'
import { useEffect, useState } from 'react'

function App() {
  const [activeSection, setActiveSection] = useState('overview')
  
  // Handle URL parameters from voice assistant
  useEffect(() => {
    // Check for section parameter in URL (sent by voice assistant)
    const params = new URLSearchParams(window.location.search)
    const sectionParam = params.get('section')
    
    // If a section parameter exists, navigate to that section
    if (sectionParam) {
      console.log(`Voice navigation requested section: ${sectionParam}`)
      setActiveSection(sectionParam)
    }
    
    // Listen for messages from voice assistant
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'voiceNavigation') {
        console.log(`Voice navigation message received: ${event.data.section}`)
        setActiveSection(event.data.section)
      }
    })
  }, [])

  return (
    <>
      <Dashboard initialSection={activeSection} />
    </>
  )
}

export default App
