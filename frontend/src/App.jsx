import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/buyer/Home';
import Dashboard from './pages/seller/Dashboard';
import CarDetail from './pages/buyer/CarDetail';
import Inquiries from './pages/seller/Inquiries';
import Profile from './pages/seller/Profile';
import Chat from './pages/seller/Chat';
import MyChats from './pages/buyer/MyChats';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import SellerLogin from './pages/auth/SellerLogin';
import SellerForgotPassword from './pages/auth/SellerForgotPassword';
import SellerResetPassword from './pages/auth/SellerResetPassword';
import CarsForRent from './pages/buyer/CarsForRent';
import RentalCarDetail from './pages/buyer/RentalCarDetail';
import MyRentalCars from './pages/seller/MyRentalCars';
import AddRentalCar from './pages/seller/AddRentalCar';
import MyRentals from './pages/buyer/MyRentals';
import RentalRequests from './pages/seller/RentalRequests';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/seller/dashboard" element={<Dashboard />} />
          <Route path="/car/:id" element={<CarDetail />} />
          <Route path="/seller/inquiries" element={<Inquiries />} />
          <Route path="/seller/profile" element={<Profile />} />
          <Route path="/seller/chat" element={<Chat />} />
          <Route path="/my-chats" element={<MyChats />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/seller/forgot-password" element={<SellerForgotPassword />} />
          <Route path="/seller/reset-password" element={<SellerResetPassword />} />
          <Route path="/cars-for-rent" element={<CarsForRent />} />
          <Route path="/rental/:id" element={<RentalCarDetail />} />
          <Route path="/seller/rental-cars" element={<MyRentalCars />} />
          <Route path="/seller/rental-cars/add" element={<AddRentalCar />} />
          <Route path="/my-rentals" element={<MyRentals />} />
          <Route path="/seller/rental-requests" element={<RentalRequests />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
