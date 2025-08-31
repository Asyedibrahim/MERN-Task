import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { CgMenuGridR } from "react-icons/cg";
import { MdInventory, MdLogout } from "react-icons/md";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { signOutSuccess } from "../redux/user/userSlice";

export default function SmSideBar() {

    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const [tab, setTab] = useState('');
    const sidebarRef = useRef(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabFromUrl = urlParams.get('tab');
        if ( tabFromUrl ) {
            setTab(tabFromUrl);
        }
    }, [location.search]);

    // Close sidebar when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
          if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
              setIsOpen(false);
          }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

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
    <div className="text-sm sm:text-base shadow py-1">
      {/* Sidebar Toggle Button */}
      <h1 className="text-2xl font-serif font-extrabold my-5 px-3">MERN TASK</h1>
      
      <button onClick={() => setIsOpen(true)} className="p-2 bg-gray-800 text-white rounded-md absolute top-5 right-2" >
        <FaBars size={24} />
      </button>

      {/* Sidebar */}
      <AnimatePresence>
          {isOpen && (
              <motion.div
                  className="fixed inset-0 z-50 bg-black/30 lg:hidden"
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <motion.aside
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 p-6 flex flex-col gap-4 lg:hidden"
                      onClick={(e) => e.stopPropagation()}
                  >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold flex items-center gap-2">
                              <CgMenuGridR className="text-2xl" /> Menu
                          </h2>
                          <button onClick={() => setIsOpen(false)} className="text-2xl font-bold">&times;</button>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                          <Link to="/dashboard?tab=products" onClick={() => setIsOpen(false)}>
                              <div className={`px-2 py-2 flex items-center rounded-md gap-2 cursor-pointer text-gray-800 font-semibold text-lg transition-all duration-100 ease-linear ${tab === 'products' ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`}>
                                  <MdInventory />
                                  Products
                              </div>
                          </Link>
                          <div className="px-2 py-2 cursor-pointer text-gray-800 text-lg font-semibold rounded-md flex items-center gap-2 hover:bg-black hover:text-white transition-all duration-100 ease-linear" onClick={handleLogout}>
                              <MdLogout className="inline-block" />
                              Log out
                          </div>
                      </div>

                  </motion.aside>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}