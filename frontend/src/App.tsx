import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import MediaLibrary from './pages/MediaLibrary'
import MediaTypeCreator from './pages/MediaTypeCreator'
import MediaDetail from './pages/MediaDetail'
import TagManagement from './pages/TagManagement'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuth } from './hooks/useAuth'

// Placeholder Page Components
const Dashboard = () => (
  <div>
    <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
    <p className="mt-2 text-slate-600">Welcome back to your media manager.</p>
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

// Component to redirect authenticated users away from login/signup
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/library" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />
        <Route 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<MediaLibrary />} />
          <Route path="/tag-management" element={<TagManagement />} />
          <Route path="/media-type-creator" element={<MediaTypeCreator />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/media/:mediaId" element={<MediaDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
