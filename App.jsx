import { useState } from 'react'
import Dashboard from './Dashboard.jsx'
import Scanner from './Scanner.jsx'

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div>
      {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
      {page === 'scanner'   && <Scanner   onNavigate={setPage} />}
    </div>
  )
}
