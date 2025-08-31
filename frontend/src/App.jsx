import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
    
      <Routes>
        <Route path='/' element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path='/dashboard' element={<Dashboard />}></Route>
        </Route>

      </Routes>

      <ToastContainer draggablePercent={60} pauseOnHover={false} theme='colored'/>

    </BrowserRouter>
  )
}
