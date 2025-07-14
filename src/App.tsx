import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import LogIn from './pages/login'
import { HomeLayout } from './components/home/layout'
import { ThemeProvider } from './components/ui/themeprovider'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LogIn />} />
            <Route path="/*" element={
              <HomeLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  {/* Add more routes here that should use the layout */}
                </Routes>
              </HomeLayout>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
