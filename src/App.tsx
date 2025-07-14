import { Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import LogIn from './pages/login'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LogIn />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
