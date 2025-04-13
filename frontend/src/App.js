import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './hooks/useAuthContext'

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import ArtisanUpload from './pages/ArtisanUpload';
import Products from './pages/Products';
import SingleProduct from './components/SingleProduct';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import Order from './pages/Order';
import AdminOrders from "./pages/AdminOrders";
import ForgotPassword from './pages/ForgotPassword';
import GoogleRedirect from './pages/GoogleRedirect';

function App() {

  const { user } = useAuthContext()

  return (
    <BrowserRouter>
      <Navbar />
      <div className="pages">
        <Routes>
          <Route
            exact
            path='/'
            element={user ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path='/login'
            element={!user ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path='/signup'
            element={!user ? <SignUp /> : <Navigate to="/" />}
          />
          <Route
            path='/forgot-password'
            element={!user ? <ForgotPassword /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path='/upload'
            element={user ? <ArtisanUpload /> : <Navigate to="/" />}
          />
          <Route
            path='/products'
            element={user ? <Products /> : <Navigate to="/" />}
          />
          <Route
            path='/cart'
            element={user ? <Cart /> : <Navigate to="/" />}
          />
          <Route
            path='/product/:id'
            element={user ? <SingleProduct /> : <Navigate to="/" />}
          />
          <Route
            path='/payment'
            element={user ? <Payment /> : <Navigate to="/login" />}
          />
          <Route 
            path="/orders" 
            element={user ? <Order /> : <Navigate to="/login" />} 
          />
          <Route 
              path="/admin-orders" 
              element={user ? <AdminOrders /> : <Navigate to="/" />} 
          />
          <Route path='/google-redirect' element={<GoogleRedirect />} />

        </Routes>
      </div>

    </BrowserRouter>
  );
}

export default App;
