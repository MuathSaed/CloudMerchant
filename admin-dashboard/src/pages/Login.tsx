import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import TokenManager from '../services/TokenManager';

let validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

let Login: React.FC = () => {
  let navigate = useNavigate();
  let [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      TokenManager.getTokens();
      if (TokenManager.getTokens().access) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Token Error:', error);
    }
  }, [TokenManager.getTokens(), navigate]);

  let formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        let response = await api.post('/auth/sign-in-admin', values);
        let { tokens, profile } = response.data;
        TokenManager.setTokens(tokens);
        setIsLoading(false);
        console.log('Logged in user:', profile);
        console.log('Access Token:', tokens.access);
        console.log('Refresh Token:', tokens.refresh);
        navigate('/dashboard'); // Redirect to dashboard after login
      } catch (error: any) {
        toast.error(error && error.response.data.message);
        console.error('Login Error:', error);
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.svg"
          alt="Logo" 
        /> 
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.email}
                </div>
              ) : null}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.password}
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading && (
                <span className="spinner-border spinner-border-sm mr-2"></span>
              )}
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
