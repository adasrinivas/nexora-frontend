import { useEffect, useState, useCallback } from 'react'
import { API_BASE_URL } from '../config/api'

function Dashboard({ user, onLogout }) {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Career Roles State
  const [careerRoles, setCareerRoles] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [roleMessage, setRoleMessage] = useState('')
  const [savingRole, setSavingRole] = useState(false)
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false)

  // Skills State
  const [skillName, setSkillName] = useState('')
  const [skillLevel, setSkillLevel] = useState('Beginner')
  const [skillMessage, setSkillMessage] = useState('')
  const [savingSkill, setSavingSkill] = useState(false)
  const [editingSkillId, setEditingSkillId] = useState(null)
  const [editingSkillLevel, setEditingSkillLevel] = useState('Beginner')

  // Projects State
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectTechnologies, setProjectTechnologies] = useState('')
  const [projectGithubUrl, setProjectGithubUrl] = useState('')
  const [projectLiveUrl, setProjectLiveUrl] = useState('')
  const [projectMessage, setProjectMessage] = useState('')
  const [savingProject, setSavingProject] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState(null)
  const [editingProjectId, setEditingProjectId] = useState(null)

  // Certifications State
  const [certName, setCertName] = useState('')
  const [certIssuer, setCertIssuer] = useState('')
  const [certIssueDate, setCertIssueDate] = useState('')
  const [certCredentialUrl, setCertCredentialUrl] = useState('')
  const [certMessage, setCertMessage] = useState('')
  const [savingCert, setSavingCert] = useState(false)
  const [editingCertId, setEditingCertId] = useState(null)
  const [deletingCertId, setDeletingCertId] = useState(null)

  // Progress State
  const [progressSkillName, setProgressSkillName] = useState('')
  const [progressPercentage, setProgressPercentage] = useState(50)
  const [progressMessage, setProgressMessage] = useState('')
  const [savingProgress, setSavingProgress] = useState(false)
  const [deletingProgressId, setDeletingProgressId] = useState(null)

  // Roadmap State
  const [roadmapMessage, setRoadmapMessage] = useState('')
  const [togglingStepId, setTogglingStepId] = useState(null)

  // Load Dashboard Data
  const loadDashboard = useCallback(async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/${user.id}`)
      if (!response.ok) {
        throw new Error('Failed to load dashboard data.')
      }
      const data = await response.json()
      setDashboard(data)
      if (data.user?.targetCareerRole?.id) {
        setSelectedRoleId(String(data.user.targetCareerRole.id))
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to backend.')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load Career Roles List
  const loadCareerRoles = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/career-roles`)
      if (response.ok) {
        const roles = await response.json()
        setCareerRoles(roles)
      }
    } catch (err) {
      console.error('Failed to fetch career roles:', err)
    }
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setError('User information is missing. Please log in again.')
      setLoading(false)
      return
    }
    setLoading(true)
    loadDashboard()
    loadCareerRoles()
  }, [user, loadDashboard, loadCareerRoles])

  // -------------------------------------------------------------
  // Career Role & Roadmap Actions
  // -------------------------------------------------------------
  const handleAssignRole = async (e) => {
    e.preventDefault()
    if (!selectedRoleId) {
      setRoleMessage('Please select a career role.')
      return
    }

    setSavingRole(true)
    setRoleMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/target-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          careerRoleId: Number(selectedRoleId),
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Could not assign target career role.')
      }

      setRoleMessage('Target career role updated successfully!')
      await loadDashboard()
    } catch (err) {
      setRoleMessage(err.message || 'Failed to update career role.')
    } finally {
      setSavingRole(false)
    }
  }

  const handleGenerateRoadmap = async () => {
    setGeneratingRoadmap(true)
    setRoadmapMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/roadmaps/generate/${user.id}`, {
        method: 'POST',
      })

      if (!response.ok) {
        const text = await response.text()
        let errMsg = 'Failed to generate roadmap.'
        try {
          const parsed = JSON.parse(text)
          errMsg = parsed.message || errMsg
        } catch {
          errMsg = text || errMsg
        }
        throw new Error(errMsg)
      }

      const generatedSteps = await response.json()
      setDashboard((prev) => ({
        ...prev,
        roadmap: generatedSteps,
      }))
      setRoadmapMessage('Custom roadmap generated successfully based on your target role!')
    } catch (err) {
      setRoadmapMessage(err.message || 'Could not generate roadmap.')
    } finally {
      setGeneratingRoadmap(false)
    }
  }

  // -------------------------------------------------------------
  // Skills CRUD
  // -------------------------------------------------------------
  const handleAddSkill = async (event) => {
    event.preventDefault()
    setSkillMessage('')

    if (!skillName.trim()) {
      setSkillMessage('Please enter a skill name.')
      return
    }

    setSavingSkill(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: skillName.trim(),
          level: skillLevel,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const details = await response.text()
        throw new Error(details || 'Could not save skill.')
      }

      setSkillName('')
      setSkillLevel('Beginner')
      setSkillMessage('Skill added successfully!')
      await loadDashboard()
    } catch (err) {
      setSkillMessage(err.message || 'Unable to save skill.')
    } finally {
      setSavingSkill(false)
    }
  }

  const handleUpdateSkillLevel = async (skill) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/skills/${skill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: skill.name,
          level: editingSkillLevel,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update skill level.')
      }

      setEditingSkillId(null)
      await loadDashboard()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteSkill = async (skill) => {
    if (!window.confirm(`Are you sure you want to delete skill "${skill.name}"?`)) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/skills/${skill.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete skill.')
      }

      await loadDashboard()
    } catch (err) {
      alert(err.message)
    }
  }

  // -------------------------------------------------------------
  // Projects CRUD
  // -------------------------------------------------------------
  const resetProjectForm = () => {
    setProjectName('')
    setProjectDescription('')
    setProjectTechnologies('')
    setProjectGithubUrl('')
    setProjectLiveUrl('')
    setProjectMessage('')
    setEditingProjectId(null)
  }

  const handleEditProject = (project) => {
    setEditingProjectId(project.id)
    setProjectName(project.name || '')
    setProjectDescription(project.description || '')
    setProjectTechnologies(project.technologies || '')
    setProjectGithubUrl(project.githubUrl || '')
    setProjectLiveUrl(project.liveUrl || '')
    setProjectMessage('Editing project: ' + project.name)

    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAddOrUpdateProject = async (event) => {
    event.preventDefault()
    setProjectMessage('')

    if (!projectName.trim()) {
      setProjectMessage('Please enter a project name.')
      return
    }

    setSavingProject(true)

    try {
      const isEditing = editingProjectId !== null
      const url = isEditing
        ? `${API_BASE_URL}/api/projects/${editingProjectId}`
        : `${API_BASE_URL}/api/projects`

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDescription.trim(),
          technologies: projectTechnologies.trim(),
          githubUrl: projectGithubUrl.trim(),
          liveUrl: projectLiveUrl.trim(),
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const details = await response.text()
        throw new Error(details || (isEditing ? 'Could not update project.' : 'Could not save project.'))
      }

      setProjectMessage(isEditing ? 'Project updated successfully!' : 'Project added successfully!')
      resetProjectForm()
      await loadDashboard()
    } catch (err) {
      setProjectMessage(err.message || 'Unable to save project.')
    } finally {
      setSavingProject(false)
    }
  }

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) return

    setProjectMessage('')
    setDeletingProjectId(project.id)

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${project.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Could not delete project.')
      }

      if (editingProjectId === project.id) {
        resetProjectForm()
      }
      setProjectMessage('Project deleted successfully!')
      await loadDashboard()
    } catch (err) {
      setProjectMessage(err.message || 'Unable to delete project.')
    } finally {
      setDeletingProjectId(null)
    }
  }

  // -------------------------------------------------------------
  // Certifications CRUD
  // -------------------------------------------------------------
  const resetCertForm = () => {
    setCertName('')
    setCertIssuer('')
    setCertIssueDate('')
    setCertCredentialUrl('')
    setCertMessage('')
    setEditingCertId(null)
  }

  const handleEditCert = (cert) => {
    setEditingCertId(cert.id)
    setCertName(cert.name || '')
    setCertIssuer(cert.issuer || '')
    setCertIssueDate(cert.issueDate || '')
    setCertCredentialUrl(cert.credentialUrl || '')
    setCertMessage('Editing certification: ' + cert.name)
    document.getElementById('certifications')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAddOrUpdateCert = async (e) => {
    e.preventDefault()
    setCertMessage('')

    if (!certName.trim() || !certIssuer.trim()) {
      setCertMessage('Certification name and issuer are required.')
      return
    }

    setSavingCert(true)

    try {
      const isEditing = editingCertId !== null
      const url = isEditing
        ? `${API_BASE_URL}/api/certifications/${editingCertId}`
        : `${API_BASE_URL}/api/certifications`

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: certName.trim(),
          issuer: certIssuer.trim(),
          issueDate: certIssueDate.trim(),
          credentialUrl: certCredentialUrl.trim(),
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error(isEditing ? 'Could not update certification.' : 'Could not add certification.')
      }

      setCertMessage(isEditing ? 'Certification updated!' : 'Certification added successfully!')
      resetCertForm()
      await loadDashboard()
    } catch (err) {
      setCertMessage(err.message || 'Error saving certification.')
    } finally {
      setSavingCert(false)
    }
  }

  const handleDeleteCert = async (cert) => {
    if (!window.confirm(`Are you sure you want to delete "${cert.name}"?`)) return
    setDeletingCertId(cert.id)

    try {
      const response = await fetch(`${API_BASE_URL}/api/certifications/${cert.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete certification.')
      }
      await loadDashboard()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingCertId(null)
    }
  }

  // -------------------------------------------------------------
  // Progress CRUD
  // -------------------------------------------------------------
  const handleAddProgress = async (e) => {
    e.preventDefault()
    setProgressMessage('')

    if (!progressSkillName.trim()) {
      setProgressMessage('Please enter a skill name.')
      return
    }

    setSavingProgress(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: progressSkillName.trim(),
          percentage: Number(progressPercentage),
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Could not record progress.')
      }

      setProgressSkillName('')
      setProgressPercentage(50)
      setProgressMessage('Progress recorded successfully!')
      await loadDashboard()
    } catch (err) {
      setProgressMessage(err.message || 'Error saving progress.')
    } finally {
      setSavingProgress(false)
    }
  }

  const handleDeleteProgress = async (prog) => {
    if (!window.confirm(`Remove progress for "${prog.skillName}"?`)) return
    setDeletingProgressId(prog.id)

    try {
      const response = await fetch(`${API_BASE_URL}/api/progress/${prog.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete progress.')
      await loadDashboard()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingProgressId(null)
    }
  }

  // -------------------------------------------------------------
  // Roadmap Actions
  // -------------------------------------------------------------
  const handleToggleRoadmapStep = async (stepId) => {
    setTogglingStepId(stepId)
    try {
      const response = await fetch(`${API_BASE_URL}/api/roadmaps/${stepId}/toggle`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to toggle step completion.')
      }

      const updatedStep = await response.json()
      setDashboard((prev) => ({
        ...prev,
        roadmap: prev.roadmap.map((s) => (s.id === stepId ? updatedStep : s)),
      }))
    } catch (err) {
      alert(err.message)
    } finally {
      setTogglingStepId(null)
    }
  }

  const handleDeleteRoadmapStep = async (stepId) => {
    if (!window.confirm('Delete this roadmap step?')) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/roadmaps/${stepId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete step.')
      setDashboard((prev) => ({
        ...prev,
        roadmap: prev.roadmap.filter((s) => s.id !== stepId),
      }))
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-message">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ marginBottom: 16 }}></div>
          <p>Loading your Nexora career dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-message" style={{ flexDirection: 'column', gap: 16 }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
        <button className="primary-btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    )
  }

  if (!dashboard) {
    return <div className="dashboard-message">No dashboard data available.</div>
  }

  // Calculated Stats
  const targetRole = dashboard.user?.targetCareerRole
  const totalSkills = dashboard.skills?.length || 0
  const totalProjects = dashboard.projects?.length || 0
  const totalCertifications = dashboard.certifications?.length || 0
  const totalRoadmapSteps = dashboard.roadmap?.length || 0
  const completedRoadmapSteps = dashboard.roadmap?.filter((s) => s.completed)?.length || 0
  const roadmapPercent = totalRoadmapSteps > 0 ? Math.round((completedRoadmapSteps / totalRoadmapSteps) * 100) : 0

  const avgProgress =
    dashboard.progress?.length > 0
      ? Math.round(dashboard.progress.reduce((sum, p) => sum + p.percentage, 0) / dashboard.progress.length)
      : 0

  return (
    <div className="dashboard">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="dashboard-logo">NEXORA</div>

        <div className="sidebar-user-brief">
          <div className="user-avatar">{dashboard.user.name.charAt(0).toUpperCase()}</div>
          <div className="user-meta">
            <span className="user-name">{dashboard.user.name}</span>
            <span className="user-role-badge">
              {targetRole ? targetRole.name : 'Target Not Selected'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#overview">📊 Overview</a>
          <a href="#career-role">🎯 Target Role</a>
          <a href="#skills">⚡ My Skills</a>
          <a href="#projects">💻 Projects</a>
          <a href="#roadmap">🗺️ Learning Roadmap</a>
          <a href="#skill-gap">🔍 Skill Gap Analysis</a>
          <a href="#progress">📈 Learning Progress</a>
          <a href="#certifications">📜 Certifications</a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main" id="overview">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, {dashboard.user.name} 👋</h1>
            <p>
              Account ID: #{dashboard.user.id} &bull; {dashboard.user.email}
            </p>
          </div>

          <button
            className="logout-btn"
            onClick={onLogout || (() => window.location.reload())}
            title="Log out from Nexora"
          >
            Logout
          </button>
        </header>

        {/* Top Summary Statistics Cards */}
        <section className="stats-grid">
          <div className="stat-card">
            <h3>Skills Tracked</h3>
            <strong>{totalSkills}</strong>
            <p>{totalSkills === 1 ? '1 skill recorded' : `${totalSkills} skills recorded`}</p>
          </div>

          <div className="stat-card">
            <h3>Portfolio Projects</h3>
            <strong>{totalProjects}</strong>
            <p>{totalProjects === 1 ? '1 project built' : `${totalProjects} projects built`}</p>
          </div>

          <div className="stat-card">
            <h3>Roadmap Completion</h3>
            <strong>{roadmapPercent}%</strong>
            <p>
              {completedRoadmapSteps} of {totalRoadmapSteps} steps done
            </p>
          </div>

          <div className="stat-card">
            <h3>Avg. Skill Mastery</h3>
            <strong>{avgProgress}%</strong>
            <p>Across tracked learning topics</p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 1. TARGET CAREER ROLE SECTION                             */}
        {/* ========================================================= */}
        <section className="dashboard-section" id="career-role">
          <div className="section-title">
            <div>
              <h2>Target Career Role</h2>
              <span className="section-subtext">
                Your roadmap and skill-gap recommendations are tailored to your chosen role.
              </span>
            </div>
          </div>

          <div className="role-banner">
            <div className="role-info">
              <span className="role-tag">Active Target</span>
              <h3>{targetRole ? targetRole.name : 'No Target Role Assigned Yet'}</h3>
              <p>
                {targetRole
                  ? targetRole.description
                  : 'Select your target career path below to unlock personalized skill-gap analysis and roadmap.'}
              </p>
            </div>

            <div className="role-actions">
              <form onSubmit={handleAssignRole} className="role-select-form">
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  disabled={savingRole}
                >
                  <option value="">-- Choose a Career Role --</option>
                  {careerRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>

                <button type="submit" className="primary-btn" disabled={savingRole}>
                  {savingRole ? 'Saving...' : 'Set Target Role'}
                </button>
              </form>

              {targetRole && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleGenerateRoadmap}
                  disabled={generatingRoadmap}
                  style={{ marginTop: 10 }}
                >
                  {generatingRoadmap ? 'Generating Steps...' : '🔄 Generate Custom Roadmap'}
                </button>
              )}
            </div>
          </div>

          {roleMessage && (
            <p
              className={roleMessage.includes('successfully') ? 'auth-message-success' : 'auth-message-error'}
              role="status"
            >
              {roleMessage}
            </p>
          )}
          {roadmapMessage && (
            <p
              className={roadmapMessage.includes('successfully') ? 'auth-message-success' : 'auth-message-error'}
              role="status"
            >
              {roadmapMessage}
            </p>
          )}
        </section>

        {/* ========================================================= */}
        {/* 2. SKILL GAP ANALYSIS ENGINE SECTION                      */}
        {/* ========================================================= */}
        <section className="dashboard-section" id="skill-gap">
          <div className="section-title">
            <div>
              <h2>Rule-Based Skill Gap Analysis</h2>
              <span className="section-subtext">
                Compares your recorded skills against the required competencies for{' '}
                <strong>{targetRole ? targetRole.name : 'your target role'}</strong>.
              </span>
            </div>
          </div>

          {!targetRole ? (
            <p className="empty-message">
              Select and assign a target career role above to view your rule-based skill gap analysis.
            </p>
          ) : dashboard.skillGaps.length === 0 ? (
            <p className="empty-message">No skill gap data available for this role yet.</p>
          ) : (
            <div className="skill-gap-table-wrapper">
              <table className="gap-table">
                <thead>
                  <tr>
                    <th>Skill Competency</th>
                    <th>Required Level</th>
                    <th>Your Level</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.skillGaps.map((gap, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{gap.skillName}</strong>
                      </td>
                      <td>
                        <span className="level-pill required">{gap.requiredLevel}</span>
                      </td>
                      <td>
                        <span className={`level-pill ${gap.available ? 'current' : 'none'}`}>
                          {gap.currentLevel || (gap.available ? 'Recorded' : 'None')}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            gap.status === 'MATCHED'
                              ? 'status-matched'
                              : gap.status === 'NEEDS_IMPROVEMENT'
                              ? 'status-improve'
                              : 'status-missing'
                          }`}
                        >
                          {gap.status === 'MATCHED'
                            ? '✓ Matched'
                            : gap.status === 'NEEDS_IMPROVEMENT'
                            ? '⚡ Needs Level-Up'
                            : '✗ Missing'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`priority-pill ${
                            gap.priority === 'HIGH'
                              ? 'p-high'
                              : gap.priority === 'MEDIUM'
                              ? 'p-med'
                              : 'p-low'
                          }`}
                        >
                          {gap.priority || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="recommendation-text">
                        {gap.recommendation ||
                          (gap.available
                            ? 'Skill acquired. Keep practicing.'
                            : 'Priority skill to acquire for target role.')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 3. LEARNING ROADMAP SECTION                               */}
        {/* ========================================================= */}
        <section className="dashboard-section" id="roadmap">
          <div className="section-title">
            <div>
              <h2>Learning Roadmap</h2>
              <span className="section-subtext">
                Ordered learning milestones for {targetRole ? targetRole.name : 'career success'}. Check off steps as you complete them!
              </span>
            </div>
            <span>
              {completedRoadmapSteps} / {totalRoadmapSteps} completed
            </span>
          </div>

          {dashboard.roadmap.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <p className="empty-message">No roadmap steps yet.</p>
              {targetRole && (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleGenerateRoadmap}
                  disabled={generatingRoadmap}
                >
                  {generatingRoadmap ? 'Generating...' : 'Generate Roadmap for ' + targetRole.name}
                </button>
              )}
            </div>
          ) : (
            <div className="roadmap-list">
              {dashboard.roadmap.map((step) => (
                <div
                  className={`roadmap-item ${step.completed ? 'step-completed' : ''}`}
                  key={step.id}
                >
                  <div
                    className={`step-checkbox ${step.completed ? 'checked' : ''}`}
                    onClick={() => handleToggleRoadmapStep(step.id)}
                    title="Click to toggle completed status"
                  >
                    {step.completed ? '✓' : step.stepNumber}
                  </div>

                  <div className="step-content">
                    <div className="step-header">
                      <h3 className={step.completed ? 'text-done' : ''}>{step.title}</h3>
                      <span className={`status-badge ${step.completed ? 'badge-done' : 'badge-pending'}`}>
                        {step.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    <p>{step.description}</p>
                    {step.skillName && (
                      <span className="step-skill-tag">🏷️ {step.skillName}</span>
                    )}
                  </div>

                  <div className="step-actions">
                    <button
                      type="button"
                      className="btn-toggle-step"
                      onClick={() => handleToggleRoadmapStep(step.id)}
                      disabled={togglingStepId === step.id}
                    >
                      {step.completed ? 'Mark Incomplete' : 'Mark Done'}
                    </button>
                    <button
                      type="button"
                      className="btn-delete-sm"
                      onClick={() => handleDeleteRoadmapStep(step.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 4. SKILLS SECTION (CRUD)                                  */}
        {/* ========================================================= */}
        <section className="dashboard-section" id="skills">
          <div className="section-title">
            <div>
              <h2>My Skills</h2>
              <span className="section-subtext">
                Record your technical competencies and proficiency levels.
              </span>
            </div>
            <span>{totalSkills} skills</span>
          </div>

          {/* Add Skill Form */}
          <form className="add-skill-form" onSubmit={handleAddSkill}>
            <h3>Add a New Skill</h3>

            <div className="form-row">
              <div style={{ flex: 2 }}>
                <label htmlFor="skillName">Skill Name</label>
                <input
                  id="skillName"
                  type="text"
                  placeholder="e.g. Java, Spring Boot, React, SQL"
                  value={skillName}
                  onChange={(event) => setSkillName(event.target.value)}
                  required
                />
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor="skillLevel">Proficiency Level</label>
                <select
                  id="skillLevel"
                  value={skillLevel}
                  onChange={(event) => setSkillLevel(event.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={savingSkill}>
              {savingSkill ? 'Saving...' : '+ Add Skill'}
            </button>

            {skillMessage && (
              <p
                className={skillMessage.includes('successfully') ? 'auth-message-success' : 'auth-message-error'}
                role="status"
              >
                {skillMessage}
              </p>
            )}
          </form>

          {/* Skills Grid */}
          {dashboard.skills.length === 0 ? (
            <p className="empty-message">No skills recorded yet. Add your first skill above!</p>
          ) : (
            <div className="skills-grid">
              {dashboard.skills.map((skill) => (
                <div className="skill-card" key={skill.id}>
                  <div>
                    <h3>{skill.name}</h3>
                    {editingSkillId === skill.id ? (
                      <div className="skill-edit-box">
                        <select
                          value={editingSkillLevel}
                          onChange={(e) => setEditingSkillLevel(e.target.value)}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                        <button
                          type="button"
                          className="btn-save-sm"
                          onClick={() => handleUpdateSkillLevel(skill)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn-cancel-sm"
                          onClick={() => setEditingSkillId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="skill-level-text">Level: {skill.level}</p>
                    )}
                  </div>

                  <div className="skill-actions-right">
                    <div className="skill-badge">{skill.level}</div>
                    {editingSkillId !== skill.id && (
                      <button
                        type="button"
                        className="btn-edit-sm"
                        onClick={() => {
                          setEditingSkillId(skill.id)
                          setEditingSkillLevel(skill.level || 'Beginner')
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-delete-sm"
                      onClick={() => handleDeleteSkill(skill)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 5. PROJECTS SECTION (CRUD)                                */}
        {/* ========================================================= */}
        <section className="dashboard-section" id="projects">
          <div className="section-title">
            <div>
              <h2>Portfolio Projects</h2>
              <span className="section-subtext">Showcase projects to demonstrate practical skill mastery.</span>
            </div>
            <span>{totalProjects} projects</span>
          </div>

          <form className="add-skill-form" onSubmit={handleAddOrUpdateProject}>
            <h3>{editingProjectId !== null ? 'Edit Project' : 'Add a New Project'}</h3>

            <label htmlFor="projectName">Project Name *</label>
            <input
              id="projectName"
              type="text"
              placeholder="e.g. Nexora Career Platform"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              required
            />

            <label htmlFor="projectDescription">Description</label>
            <textarea
              id="projectDescription"
              placeholder="Brief overview of features, architecture, and achievements..."
              value={projectDescription}
              onChange={(event) => setProjectDescription(event.target.value)}
              rows="3"
            />

            <label htmlFor="projectTechnologies">Technologies Used</label>
            <input
              id="projectTechnologies"
              type="text"
              placeholder="e.g. Java, Spring Boot, React, MySQL, Docker"
              value={projectTechnologies}
              onChange={(event) => setProjectTechnologies(event.target.value)}
            />

            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label htmlFor="projectGithubUrl">GitHub Repo URL</label>
                <input
                  id="projectGithubUrl"
                  type="url"
                  placeholder="https://github.com/..."
                  value={projectGithubUrl}
                  onChange={(event) => setProjectGithubUrl(event.target.value)}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor="projectLiveUrl">Live Demo URL</label>
                <input
                  id="projectLiveUrl"
                  type="url"
                  placeholder="https://..."
                  value={projectLiveUrl}
                  onChange={(event) => setProjectLiveUrl(event.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="primary-btn" disabled={savingProject}>
                {savingProject
                  ? 'Saving...'
                  : editingProjectId !== null
                  ? 'Save Changes'
                  : '+ Add Project'}
              </button>

              {editingProjectId !== null && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetProjectForm}
                  disabled={savingProject}
                >
                  Cancel Editing
                </button>
              )}
            </div>

            {projectMessage && (
              <p
                className={projectMessage.includes('successfully') ? 'auth-message-success' : 'auth-message-error'}
                role="status"
              >
                {projectMessage}
              </p>
            )}
          </form>

          {dashboard.projects.length === 0 ? (
            <p className="empty-message">No projects added yet. Showcase your work above!</p>
          ) : (
            <div className="projects-grid">
              {dashboard.projects.map((project) => (
                <div className="project-card" key={project.id}>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  {project.technologies && (
                    <p className="technologies">🛠️ {project.technologies}</p>
                  )}

                  <div className="project-links">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="link-tag">
                        GitHub ↗
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="link-tag live">
                        Live Demo ↗
                      </a>
                    )}
                  </div>

                  <div className="project-actions">
                    <button
                      type="button"
                      className="btn-edit-sm"
                      onClick={() => handleEditProject(project)}
                      disabled={deletingProjectId !== null}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-delete-sm"
                      onClick={() => handleDeleteProject(project)}
                      disabled={deletingProjectId !== null}
                    >
                      {deletingProjectId === project.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 6. LEARNING PROGRESS SECTION (CRUD)                       */}
        {/* ========================================================= */}
        <section className="dashboard-section" id="progress">
          <div className="section-title">
            <div>
              <h2>Learning Progress</h2>
              <span className="section-subtext">Track completion percentages across your current subjects.</span>
            </div>
            <span>Avg: {avgProgress}%</span>
          </div>

          <form className="add-skill-form" onSubmit={handleAddProgress}>
            <h3>Update / Log Skill Progress</h3>

            <div className="form-row">
              <div style={{ flex: 2 }}>
                <label htmlFor="progSkill">Topic / Skill Name</label>
                <input
                  id="progSkill"
                  type="text"
                  placeholder="e.g. Spring Security, React Hooks"
                  value={progressSkillName}
                  onChange={(e) => setProgressSkillName(e.target.value)}
                  required
                />
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor="progPercent">Percentage: {progressPercentage}%</label>
                <input
                  id="progPercent"
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercentage}
                  onChange={(e) => setProgressPercentage(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={savingProgress}>
              {savingProgress ? 'Saving...' : 'Log Progress'}
            </button>

            {progressMessage && (
              <p
                className={progressMessage.includes('successfully') ? 'auth-message-success' : 'auth-message-error'}
                role="status"
              >
                {progressMessage}
              </p>
            )}
          </form>

          {dashboard.progress.length === 0 ? (
            <p className="empty-message">No progress recorded yet. Log your first topic above.</p>
          ) : (
            <div className="progress-list">
              {dashboard.progress.map((item) => (
                <div className="progress-item" key={item.id}>
                  <div className="progress-info">
                    <span className="prog-title">{item.skillName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <strong>{item.percentage}%</strong>
                      <button
                        type="button"
                        className="btn-delete-sm"
                        onClick={() => handleDeleteProgress(item)}
                        disabled={deletingProgressId === item.id}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 7. CERTIFICATIONS SECTION (CRUD)                          */}
        {/* ========================================================= */}
        <section className="dashboard-section" id="certifications">
          <div className="section-title">
            <div>
              <h2>Certifications</h2>
              <span className="section-subtext">Add verified credentials and exam certificates.</span>
            </div>
            <span>{totalCertifications} certificates</span>
          </div>

          <form className="add-skill-form" onSubmit={handleAddOrUpdateCert}>
            <h3>{editingCertId !== null ? 'Edit Certification' : 'Add Certification'}</h3>

            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label htmlFor="certName">Certificate Name *</label>
                <input
                  id="certName"
                  type="text"
                  placeholder="e.g. Oracle Certified Java Professional"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  required
                />
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor="certIssuer">Issuing Organization *</label>
                <input
                  id="certIssuer"
                  type="text"
                  placeholder="e.g. Oracle, Coursera, AWS"
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label htmlFor="certDate">Issue Date</label>
                <input
                  id="certDate"
                  type="date"
                  value={certIssueDate}
                  onChange={(e) => setCertIssueDate(e.target.value)}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor="certUrl">Verification / Credential URL</label>
                <input
                  id="certUrl"
                  type="url"
                  placeholder="https://..."
                  value={certCredentialUrl}
                  onChange={(e) => setCertCredentialUrl(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="primary-btn" disabled={savingCert}>
                {savingCert ? 'Saving...' : editingCertId !== null ? 'Save Changes' : '+ Add Certificate'}
              </button>

              {editingCertId !== null && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetCertForm}
                  disabled={savingCert}
                >
                  Cancel
                </button>
              )}
            </div>

            {certMessage && (
              <p
                className={certMessage.includes('successfully') ? 'auth-message-success' : 'auth-message-error'}
                role="status"
              >
                {certMessage}
              </p>
            )}
          </form>

          {dashboard.certifications.length === 0 ? (
            <p className="empty-message">No certifications added yet.</p>
          ) : (
            <div className="certification-grid">
              {dashboard.certifications.map((certificate) => (
                <div className="certificate-card" key={certificate.id}>
                  <h3>{certificate.name}</h3>
                  <p>Issued by: <strong>{certificate.issuer}</strong></p>
                  {certificate.issueDate && <span className="cert-date">Date: {certificate.issueDate}</span>}

                  {certificate.credentialUrl && (
                    <p style={{ marginTop: 8 }}>
                      <a href={certificate.credentialUrl} target="_blank" rel="noreferrer" className="link-tag">
                        Verify Credential ↗
                      </a>
                    </p>
                  )}

                  <div className="project-actions" style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="btn-edit-sm"
                      onClick={() => handleEditCert(certificate)}
                      disabled={deletingCertId !== null}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-delete-sm"
                      onClick={() => handleDeleteCert(certificate)}
                      disabled={deletingCertId !== null}
                    >
                      {deletingCertId === certificate.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard
