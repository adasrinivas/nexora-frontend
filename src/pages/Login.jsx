import { useState } from 'react'

function Login({ onLoginSuccess, onRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)

    if (!email.trim() || !password) {
      setIsError(true)
      setMessage('Please enter both email and password.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      })

      const responseText = await response.text()
      let data = {}

      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        data = { message: responseText }
      }

      if (!response.ok) {
        setIsError(true)
        if (response.status === 401) {
          setMessage('Invalid email or password. Please try again.')
        } else {
          const errorMessage =
            data.message || data.error || (typeof data === 'string' ? data : 'Login failed.')
          setMessage(errorMessage)
        }
        return
      }

      setIsError(false)
      setMessage('Login successful!')

      // Pass authenticated user object ({ id, name, email }) to parent App
      onLoginSuccess(data)
    } catch (error) {
      console.error('Login network error:', error)
      setIsError(true)
      setMessage('Could not reach the backend server (http://localhost:8080). Check that it is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Login to continue your Nexora journey.</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && (
          <p className={isError ? 'auth-message-error' : 'auth-message-success'} role="status">
            {message}
          </p>
        )}

        <p className="register-text">
          Don't have an account?{' '}
          <span
            onClick={onRegister}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onRegister()
              }
            }}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
