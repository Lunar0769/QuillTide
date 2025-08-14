import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { register, reset } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { firstName, lastName, username, email, phone, password, confirmPassword } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      console.error('Registration error:', message);
      dispatch(reset());
    }

    if (isSuccess && user) {
      toast.success('Registration successful! Welcome to QuillTide!');
      console.log('Registration successful, user:', user);
      // Small delay to ensure state is properly set before navigation
      setTimeout(() => {
        navigate('/');
      }, 100);
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !username || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const userData = {
      firstName,
      lastName,
      username,
      email,
      phone: phone || undefined,
      password,
    };

    dispatch(register(userData));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign Up - QuillTide</title>
        <meta name="description" content="Create your QuillTide account and start blogging" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Link to="/" className="flex justify-center">
              <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                QuillTide
              </h1>
            </Link>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="card p-8">
            {/* Registration Form */}
            <form className="space-y-6" onSubmit={onSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      name="firstName"
                      type="text"
                      required
                      className="input"
                      placeholder="First name"
                      value={firstName}
                      onChange={onChange}
                    />
                  </div>
                  <div>
                    <input
                      name="lastName"
                      type="text"
                      required
                      className="input"
                      placeholder="Last name"
                      value={lastName}
                      onChange={onChange}
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      name="username"
                      type="text"
                      required
                      className="input pl-10"
                      placeholder="Username"
                      value={username}
                      onChange={onChange}
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      name="email"
                      type="email"
                      required
                      className="input pl-10"
                      placeholder="Email address"
                      value={email}
                      onChange={onChange}
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      name="phone"
                      type="tel"
                      className="input pl-10"
                      placeholder="Phone number (optional)"
                      value={phone}
                      onChange={onChange}
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="input pl-10 pr-10"
                      placeholder="Password"
                      value={password}
                      onChange={onChange}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="input pl-10 pr-10"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={onChange}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                </button>
              </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;