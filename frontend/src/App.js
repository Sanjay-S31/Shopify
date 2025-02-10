import { BrowserRouter , Routes , Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './hooks/useAuthContext'

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import ArtisanUpload from './pages/ArtisanUpload';
import Products from './pages/Products';
import SingleProduct from './components/SingleProduct';
import Cart from './pages/Cart';

function App() {

  const {user} = useAuthContext()

  return (
      <BrowserRouter>
      <Navbar/>
      <div className="pages">
        <Routes>
            <Route
              exact
              path='/'
              element = {user ? <Home/> : <Navigate to="/login" />}
            />
            <Route
              path='/login'
              element = {!user ? <Login/> : <Navigate to="/" />}
            />
              <Route
              path='/signup'
              element = {!user ? <SignUp/> : <Navigate to="/" />}
            />
            <Route
              path='/upload'
              element = {user ? <ArtisanUpload/> : <Navigate to="/" />}
            />
            <Route
              path='/product'
              element = {user ? <Products/> : <Navigate to="/" />}
            />
            <Route
              path='/cart'
              element = {user ? <Cart/> : <Navigate to="/" />}
            />
            <Route
              path='/product/:id'
              element = {user ? <SingleProduct/> : <Navigate to="/" />}
            />
        </Routes>
      </div>
        
      </BrowserRouter>
  );
}

export default App;
