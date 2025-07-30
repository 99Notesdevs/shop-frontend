import { Route, BrowserRouter, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/cart-context';
import LogIn from './pages/login';
import { HomeLayout } from './components/home/layout';
import { ThemeProvider } from './components/ui/themeprovider';
import Home from './pages/home';
import ProductPage from './pages/product-page';
import ContactUs from './pages/contactus';
import CartPage from './pages/cart';
import AddProduct from './pages/add-product';
import WishlistPage from './pages/wishlist';
import AddCategory from './pages/add-category';
// import Checkout from './pages/checkout';
import PaymentSuccess from './pages/payment/success';
import PaymentFailure from './pages/payment/failure';
import AllProduct from './pages/all-product';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/login" element={<LogIn />} />
              <Route path="/*" element={
                <HomeLayout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/Products" element={<AllProduct />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/add-product" element={<AddProduct />} />
                    <Route path="/add-category" element={<AddCategory />} />
                    {/* <Route path="/checkout" element={<Checkout />} /> */}
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/failure" element={<PaymentFailure />} />
                  </Routes>
                </HomeLayout>
              } />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App
