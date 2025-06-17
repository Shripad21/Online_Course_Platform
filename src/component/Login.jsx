import React, { useState } from 'react'
import {Link, useAsyncError, useNavigate} from 'react-router-dom'
import {login as authLogin} from '../store/authSlice'
import {Button, Input, Logo} from './index'
import authService from '../appwrite/auth'
import {useForm} from 'react-hook-form'
import { useDispatch } from 'react-redux'

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()
    const [error, setError]  = useState('')

    const login = async(data) => {
        setError('')
        try {
            const session = await authService.login(data)
             if (session) {
      const userWithRole = await authService.getCurrentUserWithRole(); // ✅ includes role
      if (userWithRole) {
        dispatch(authLogin(userWithRole)); // ✅ stores full user with role
        navigate('/');
      }
    }
        } catch (error) {
            setError(error.message)
            
        }
    }
    return (
        <div className="flex items-center justify-center w-full">
          <div className="mx-auto w-full max-w-lg bg-white rounded-xl p-10 border border-gray-300 shadow-md">
            <div className="mb-4 flex justify-center">
              <span className="inline-block w-full max-w-[100px]">
                <Logo width="100%" />
              </span>
            </div>
            <h2 className="text-center text-2xl font-bold leading-tight text-gray-800">Sign in to your account</h2>
            <p className="mt-2 text-center text-base text-gray-600">
              Don&apos;t have an account?&nbsp;
              <Link
                to="/signup"
                className="font-medium text-blue-600 transition-all duration-200 hover:underline"
              >
                Sign Up
              </Link>
            </p>
            {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
            <form onSubmit={handleSubmit(login)} className="mt-8">
              <div className="space-y-5">
                <Input
                  label="Email"
                  placeholder="Enter your Email"
                  type="email"
                  {...register('email', {
                    required: true,
                    validate: {
                      matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                        "Email address must be a valid address",
                    }
                  })}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password', {
                    required: true,
                  })}
                />
                <Button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700">
                  Sign in
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
      
}

export default Login