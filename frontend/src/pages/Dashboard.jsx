import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LgSideBar from '../components/LgSideBar'
import SmSideBar from '../components/SmSideBar';
import ProductList from './ProductList';

export default function Dashboard() {

  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('');
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentUser) return;
  
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
  
    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else {
      navigate('/dashboard?tab=products');
    }
  }, [location.search, navigate]);

  return (
    <div className='flex flex-col lg:flex-row min-h-screen'>

      {/* SideBar large device */}
      <div className='lg:w-72 hidden lg:inline fixed h-full'>
        <LgSideBar />
      </div>

      {/* SideBar small device */}
      <div className="lg:hidden">
        <SmSideBar />
      </div>

      {tab === 'products' && <ProductList />}

    </div>
  )
}