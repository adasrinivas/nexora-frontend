
import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function App() {
  const [page, setPage] = useState('login')
  const [loggedInUser, setLoggedInUser] = useState(null)

  if (page === 'dashboard') {
    return (
      <Dashboard
        user={loggedInUser}
        onLogout={() => {
          setLoggedInUser(null)
          setPage('login')
        }}
      />
    )
  }

  if (page === 'register') {
    return (
      <Register
        onRegisterSuccess={() => setPage('login')}
        onBackToLogin={() => setPage('login')}
      />
    )
  }

  return (
    <Login
      onLoginSuccess={(user) => {
        setLoggedInUser(user)
        setPage('dashboard')
      }}
      onRegister={() => setPage('register')}
    />
  )
}

export default App
