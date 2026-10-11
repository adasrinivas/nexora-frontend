import { useState } from 'react'

function Register({ onRegisterSuccess, onBackToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)

    if (!name.trim() || !email.trim() || !password.trim()) {
      setIsError(true)
      setMessage('Please fill in all fields.')
      return
    }

    if (password.length < 4) {
      setIsError(true)
      setMessage('Password must be at least 4 characters long.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
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

      if (response.ok) {
        setIsError(false)
        setMessage('Registration successful! Redirecting to login...')
        setTimeout(() => {
          onRegisterSuccess()
        }, 1200)
      } else {
        setIsError(true)
        const errMsg =
          data.message || data.error || (typeof data === 'string' ? data : 'Registration failed.')
        setMessage(errMsg)
      }
    } catch (error) {
      console.error('Registration network error:', error)
      setIsError(true)
      setMessage('Cannot connect to backend server (http://localhost:8080). Make sure it is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Create Account</h1>
        <p className="login-subtitle">Start your Nexora journey.</p>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="e.g. Srinivas Ada"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="At least 4 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {message && (
          <p className={isError ? 'auth-message-error' : 'auth-message-success'} role="status">
            {message}
          </p>
        )}

        <p className="register-text">
          Already have an account?{' '}
          <span onClick={onBackToLogin} role="button" tabIndex={0}>
            Login
          </span>
        </p>
      </div>
    </div>
  )
}

export default Register