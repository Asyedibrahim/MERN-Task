import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdInventory, MdLogout } from "react-icons/md";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { signOutSuccess } from '../redux/user/userSlice.js';
import { useDispatch } from 'react-redux';

export default function LgSideBar() {

    const location = useLocation();
    const [tab, setTab] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabFromUrl = urlParams.get('tab');
        if ( tabFromUrl ) {
            setTab(tabFromUrl);
        }
    }, [location.search]);

    const handleLogout = async () => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'You will be logged out of your account!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Log out!',
                cancelButtonText: 'Cancel!'
            });
            if (result.isConfirmed) {
                const res = await fetch('/api/users/signout',{
                    method: 'POST'
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Logged out successfully!', { theme: 'colored' });
                    dispatch(signOutSuccess(data));
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

  return (
    <div className="remove-scrollbar w-full md:w-[17rem] pb-2 bg-gray-100 shadow-md h-screen overflow-y-auto">
        <h1 className='font-serif text-2xl font-extrabold py-3 text-center font-cinzel'>MERN TASK</h1>
        <div className='flex flex-col gap-3'>
            <Link to="/dashboard?tab=products" className="mx-3">
                <div className={`px-2 py-2 flex items-center rounded-md gap-2 cursor-pointer text-gray-800 font-semibold text-lg transition-all duration-100 ease-linear ${tab === 'products' ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`}>
                    <MdInventory />
                    Products
                </div>
            </Link>
            <div className="mx-3 px-2 py-2 cursor-pointer text-gray-800 text-lg font-semibold rounded-md flex items-center gap-2 hover:bg-black hover:text-white transition-all duration-100 ease-linear" onClick={handleLogout}>
                <MdLogout className="inline-block" />
                Log out
            </div>
        </div>
    </div>
  )
}