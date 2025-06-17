import React, { useState } from 'react';
import authService from '../appwrite/auth';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { Button, Input } from './index';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const create = async (data) => {
    if (data.role === 'admin') return setError('Admin signup is not allowed.');
    
    setError('');
    setIsLoading(true);
    
    try {
      const session = await authService.createAccount(data);
      if (!session) throw new Error('Account creation failed.');
      
      const user = await authService.getCurrentUserWithRole();
      await authService.saveUserRole({ userId: user.$id, role: data.role });
      
      dispatch(login({ ...user, role: data.role }));
      navigate('/');
    } catch (error) {
      setError(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br  px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {/* Brand Icon */}
        {/* <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div> */}

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create account</h2>
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">Sign In</Link>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(create)} className="space-y-6">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            disabled={isLoading}
            {...register('name', { required: 'Full name is required' })}
          />
          {errors.name && <p className="text-red-600 text-sm -mt-4">{errors.name.message}</p>}

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            disabled={isLoading}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, message: 'Invalid email' }
            })}
          />
          {errors.email && <p className="text-red-600 text-sm -mt-4">{errors.email.message}</p>}

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            disabled={isLoading}
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
          />
          {errors.password && <p className="text-red-600 text-sm -mt-4">{errors.password.message}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              disabled={isLoading}
              {...register('role', { required: 'Please select a role' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Choose your role</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
            {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </div>
            ) : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;