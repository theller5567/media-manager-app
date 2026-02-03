import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/BaseLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppErrorBoundary } from '@/components/auth/AppErrorBoundary'
import { DemoModeBanner } from '@/components/layout/DemoModeBanner'
import MediaLibrary from '@/pages/MediaLibrary'
import MediaTypeCreator from '@/pages/MediaTypeCreator'
import MediaDetail from '@/pages/MediaDetail'
import TagManagement from '@/pages/TagManagement'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import { useAuth } from '@/hooks/useAuth'
import Dashboard from '@/pages/Dashboard'
import Settings from '@/pages/Settings'


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

function AppContentWithErrorBoundary() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }
  return (
    <AppErrorBoundary onLogout={handleLogout}>
      <DemoModeBanner />
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/media/:mediaId" element={<MediaDetail />} />
        </Route>
      </Routes>
    </AppErrorBoundary>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContentWithErrorBoundary />
    </BrowserRouter>
  )
}

export default App
