import React, { useState } from 'react';
import authService from '../appwrite/auth';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { Button, Input, Logo } from './index';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();

  const create = async (data) => {
    setError('');
    try {
      if (data.role === 'admin') {
        setError('Admin signup is not allowed.');
        return;
      }

      // 1. Create user account
      const session = await authService.createAccount(data);
      if (!session) throw new Error('Account creation failed.');

      // 2. Get current user
      const user = await authService.getCurrentUserWithRole();

      // 3. Save role to Appwrite DB
      await authService.saveUserRole({
        userId: user.$id,
        role: data.role,
      });

      // 4. Dispatch to Redux & navigate
      dispatch(login({ ...user, role: data.role }));
      navigate('/');
    } catch (error) {
      setError(error.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="mx-auto w-full max-w-lg bg-white rounded-xl p-10 border border-gray-300 shadow-md">
        <div className="mb-4 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            <Logo width="100%" />
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight text-gray-800">
          Sign up to create account
        </h2>
        <p className="mt-2 text-center text-base text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 transition-all duration-200 hover:underline"
          >
            Sign In
          </Link>
        </p>
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

        <form onSubmit={handleSubmit(create)}>
          <div className="space-y-5">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              {...register('name', { required: true })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter your Email"
              {...register('email', {
                required: true,
                validate: {
                  matchPattern: (value) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    'Email address must be valid',
                },
              })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...register('password', { required: true })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Role
              </label>
              <select
                {...register('role', { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">-- Choose a role --</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
