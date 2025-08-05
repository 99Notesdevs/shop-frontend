import { Route, BrowserRouter, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import LogIn from './pages/login';
import { HomeLayout } from './components/home/layout';
import { ThemeProvider } from './components/ui/themeprovider';
import Home from './pages/home';
import ProductPage from './pages/product-page';
import ContactUs from './pages/contactus';
import CartPage from './pages/cart';
import ProductForm from './components/admin-dashboard/add-product';
import WishlistPage from './pages/wishlist';
import AddCategory from './components/admin-dashboard/add-category';
import Checkout from './pages/checkout';
import PaymentFailure from './pages/payment/failure';
import AllProduct from './pages/all-product';
import PaymentSuccess from './pages/payment/success';
import AdminLogin from './components/admin-dashboard/admin-login';
import AdminLayout from './components/admin-dashboard/layout';
import AdminDashboard from './pages/admin-dashboard';
import ManageProduct from './components/admin-dashboard/manage-product';
import ManageCategory from './components/admin-dashboard/manage-category';
import UserProfile from './pages/user-profile';
import MyOrders from './pages/myorders';
import OrderDetail from './components/order/order-detail';
import OfferMessageAdmin from './components/admin-dashboard/offer-message';
import ManageOrders from './components/admin-dashboard/manage-orders';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
            <Routes>
              <Route path="/login" element={<LogIn />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="login" element={<AdminLogin />} />
                <Route path="add-product" element={<ProductForm />} />
                <Route path="products/edit/:id" element={<ProductForm />} />
                <Route path="add-category" element={<AddCategory />} />
                <Route path="categories/edit/:id" element={<AddCategory />} />
                <Route path="manage-product" element={<ManageProduct />} />
                <Route path="manage-category" element={<ManageCategory />} />
                <Route path="offer-message" element={<OfferMessageAdmin />} />
                <Route path="manage-orders" element={<ManageOrders />} />
              </Route>

              {/* Main App Routes */}
              <Route path="/*" element={
                <HomeLayout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/Products" element={<AllProduct />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                   
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/failure" element={<PaymentFailure />} />

                    {/* users route only after sign in */}
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/myorders" element={<MyOrders />} />
                    <Route path="/order/:id" element={<OrderDetail />} />
                  </Routes>
                </HomeLayout>
              } />
            </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App
