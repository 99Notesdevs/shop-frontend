import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import LogIn from './pages/login'
import { HomeLayout } from './components/home/layout'
import { ThemeProvider } from './components/ui/themeprovider'
import Home from './pages/home'
import Products from './pages/products'
import ProductPage from './pages/product-page'
import ContactUs from './pages/contactus'
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
                <Route path="/" element={<Home />} />  
                <Route path="/products" element={<Products />} />  
                <Route path="/product/:id" element={<ProductPage />} />  
                <Route path="/contact" element={<ContactUs />} />  
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
