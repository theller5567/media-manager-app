import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import MediaLibrary from './pages/MediaLibrary'

// Placeholder Page Components
const Dashboard = () => (
  <div>
    <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
    <p className="mt-2 text-slate-600">Welcome back to your media manager.</p>
  </div>
)

const TagManagement = () => (
  <div>
    <h2 className="text-2xl font-bold text-slate-900">Tag Management</h2>
    <p className="mt-2 text-slate-600">Manage your hierarchical tags and categories here.</p>
  </div>
)

const UserProfile = () => (
  <div>
    <h2 className="text-2xl font-bold text-slate-900">User Profile</h2>
    <p className="mt-2 text-slate-600">Update your personal information and preferences.</p>
  </div>
)

const Settings = () => (
  <div>
    <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
    <p className="mt-2 text-slate-600">Configure global application settings and integrations.</p>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<MediaLibrary />} />
          <Route path="/tags" element={<TagManagement />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
