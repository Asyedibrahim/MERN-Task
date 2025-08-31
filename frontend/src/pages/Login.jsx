import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInFailure, signInStart, signInSuccess } from '../redux/user/userSlice.js';
import { toast } from 'react-toastify';

export default function Login() {

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            dispatch(signInStart());
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.message);
                dispatch(signInFailure(data.message));
                setLoading(false);
                return;
            }

            toast.success('Sign in successful!');
            dispatch(signInSuccess(data));
            setLoading(false);
            navigate('/dashboard', { replace: true });

        } catch (error) {
            toast.error(error.message);
            dispatch(signInFailure(error.message));
            setLoading(false);
        }
    }

    const handleShow = () => {
        const show = document.getElementById('password');
        show.type = show.type === 'password' ? 'text' : 'password';
    }

    return (
        <div className='bg-gray-100 min-h-screen flex items-center justify-center p-4'>
            <div className="bg-white shadow rounded-lg p-8 w-xl mx-auto">
                {/* Right Side */}
                <div className="flex-1">
                    <h1 className='text-3xl font-bold font-cinzel'>Admin Login</h1>
                    <form className="flex flex-col gap-5 mt-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor='email' className='block text-sm font-semibold mb-1'>Your Email</label>
                            <input
                                id='email'
                                type='text'
                                onChange={handleChange}
                                className='w-full px-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1'
                                placeholder='company@gmail.com'
                            />
                        </div>
                        <div>
                            <label htmlFor='password' className='block text-sm font-semibold mb-1'>Your Password</label>
                            <input
                                id='password'
                                type='password'
                                onChange={handleChange}
                                className='w-full px-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1'
                                placeholder='**********'
                            />
                        </div>
                        <div className='flex gap-2 items-center'>
                            <input type='checkbox' onClick={handleShow} id='show' />
                            <label htmlFor="show" className='cursor-pointer'>Show password</label>
                        </div>
                        <button
                            type='submit'
                            className='uppercase flex items-center gap-2 justify-center py-2 bg-black text-white rounded hover:bg-gray-950 transition'
                            disabled={loading}
                        >
                            {loading && (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                            )}
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
