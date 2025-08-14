import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { login, reset } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);


  const { identifier, password } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && user) {
      toast.success('Login successful!');
      navigate(from, { replace: true });
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch, from]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const userData = {
      identifier,
      password,
    };

    dispatch(login(userData));
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
        <title>Login - QuillTide</title>
        <meta name="description" content="Login to your QuillTide account" />
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
              Welcome back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="card p-8">
            {/* Password Login Form */}
            <form className="space-y-6" onSubmit={onSubmit}>
                <div>
                  <label htmlFor="identifier" className="sr-only">
                    Email or Username
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      required
                      className="input pl-10"
                      placeholder="Email or username"
                      value={identifier}
                      onChange={onChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="password"
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

                <div className="flex items-center justify-between">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Sign in'}
                </button>
              </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;